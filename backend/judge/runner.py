"""
Secure code execution runner using Docker.
"""
import os
import time
import docker
import tempfile
from django.conf import settings
from typing import Dict, Optional, Tuple


class CodeRunner:
    """Secure code runner using Docker containers."""
    
    def __init__(self):
        self.client = None
        try:
            self.client = docker.from_env()
        except Exception as e:
            print(f"Warning: Could not connect to Docker: {e}")
            print("Falling back to local execution (not recommended for production)")
    
    def run_python(self, code: str, input_data: str, timeout: int = None) -> Dict:
        """
        Run Python code in a Docker container.
        
        Returns:
            dict with keys: stdout, stderr, exit_code, runtime_ms, memory_kb
        """
        timeout = timeout or getattr(settings, 'JUDGE_TIMEOUT_SECONDS', 2)
        memory_limit = getattr(settings, 'JUDGE_MEMORY_LIMIT_MB', 256)
        docker_image = getattr(settings, 'JUDGE_DOCKER_IMAGE', 'python:3.11-slim')
        
        if not self.client:
            # Fallback to local execution (unsafe, only for development)
            return self._run_local_python(code, input_data, timeout)
        
        # Create temporary file for code
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            code_file = f.name
        
        try:
            # Run in Docker container
            start_time = time.time()
            
            # Use run with input_data as stdin
            try:
                container_output = self.client.containers.run(
                    image=docker_image,
                    command=['python', '/tmp/code.py'],
                    mem_limit=f'{memory_limit}m',
                    memswap_limit=f'{memory_limit}m',
                    cpu_period=100000,
                    cpu_quota=int(100000 * float(getattr(settings, 'JUDGE_CPU_LIMIT', '0.5'))),
                    network_disabled=True,
                    remove=True,
                    detach=False,
                    volumes={
                        code_file: {'bind': '/tmp/code.py', 'mode': 'ro'}
                    },
                    working_dir='/tmp',
                    timeout=timeout,
                    stdin_open=True,
                )
                
                # Parse output
                if isinstance(container_output, bytes):
                    stdout = container_output.decode('utf-8', errors='replace')
                    stderr = ''
                    exit_code = 0
                else:
                    stdout = str(container_output) if container_output else ''
                    stderr = ''
                    exit_code = 0
                    
            except docker.errors.ContainerError as e:
                stdout = e.stdout.decode('utf-8', errors='replace') if e.stdout else ''
                stderr = e.stderr.decode('utf-8', errors='replace') if e.stderr else str(e)
                exit_code = e.exit_status
            
            # Get runtime
            runtime_ms = int((time.time() - start_time) * 1000)
            
            return {
                'stdout': stdout,
                'stderr': stderr,
                'exit_code': exit_code,
                'runtime_ms': runtime_ms,
                'memory_kb': None,  # Docker stats would be needed for accurate memory
            }
            
        except docker.errors.ContainerError as e:
            return {
                'stdout': '',
                'stderr': str(e),
                'exit_code': 1,
                'runtime_ms': timeout * 1000,
                'memory_kb': None,
            }
        except docker.errors.Timeout as e:
            return {
                'stdout': '',
                'stderr': f'Execution timeout: {e}',
                'exit_code': 124,  # Timeout exit code
                'runtime_ms': timeout * 1000,
                'memory_kb': None,
            }
        except Exception as e:
            return {
                'stdout': '',
                'stderr': f'Execution error: {e}',
                'exit_code': 1,
                'runtime_ms': 0,
                'memory_kb': None,
            }
        finally:
            # Clean up
            if os.path.exists(code_file):
                os.unlink(code_file)
    
    def _run_local_python(self, code: str, input_data: str, timeout: int) -> Dict:
        """
        Fallback local execution (UNSAFE - only for development).
        """
        import subprocess
        import tempfile

        result = {
            'stdout': '',
            'stderr': '',
            'exit_code': 0,
            'runtime_ms': 0,
            'memory_kb': None,
        }

        # Write code to a temp file so multi-line scripts work correctly
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            code_file = f.name

        start_time = time.time()

        try:
            process = subprocess.Popen(
                ['python3', code_file],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
            )

            stdout, stderr = process.communicate(input=input_data, timeout=timeout)
            exit_code = process.returncode

            result['stdout'] = stdout
            result['stderr'] = stderr
            result['exit_code'] = exit_code

        except subprocess.TimeoutExpired:
            process.kill()
            process.communicate()
            result['stderr'] = f'Execution timeout after {timeout} seconds'
            result['exit_code'] = 124
        except Exception as e:
            result['stderr'] = str(e)
            result['exit_code'] = 1
        finally:
            if os.path.exists(code_file):
                os.unlink(code_file)

        result['runtime_ms'] = int((time.time() - start_time) * 1000)

        return result
    
    def normalize_output(self, output: str) -> str:
        """Normalize output for comparison (trim whitespace, normalize newlines)."""
        return '\n'.join(line.rstrip() for line in output.strip().splitlines())

    # ---- multi-language local execution helpers ----

    def _run_local_code(self, code: str, language: str, input_data: str, timeout: int) -> Dict:
        """Route to the correct local runner based on language."""
        if language == 'python':
            return self._run_local_python(code, input_data, timeout)
        elif language == 'cpp':
            return self._run_local_cpp(code, input_data, timeout)
        elif language == 'java':
            return self._run_local_java(code, input_data, timeout)
        elif language == 'javascript':
            return self._run_local_javascript(code, input_data, timeout)
        else:
            return {
                'stdout': '',
                'stderr': f'Unsupported language: {language}',
                'exit_code': 1,
                'runtime_ms': 0,
                'memory_kb': None,
            }

    def _run_local_cpp(self, code: str, input_data: str, timeout: int) -> Dict:
        import subprocess, tempfile
        result = {'stdout': '', 'stderr': '', 'exit_code': 0, 'runtime_ms': 0, 'memory_kb': None}

        with tempfile.NamedTemporaryFile(mode='w', suffix='.cpp', delete=False) as f:
            f.write(code)
            src = f.name
        exe = src.replace('.cpp', '')

        start_time = time.time()
        try:
            # Compile
            comp = subprocess.run(['g++', '-o', exe, src], capture_output=True, text=True, timeout=timeout)
            if comp.returncode != 0:
                result['stderr'] = comp.stderr
                result['exit_code'] = comp.returncode
                return result
            # Run
            proc = subprocess.Popen([exe], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            stdout, stderr = proc.communicate(input=input_data, timeout=timeout)
            result['stdout'] = stdout
            result['stderr'] = stderr
            result['exit_code'] = proc.returncode
        except subprocess.TimeoutExpired:
            result['stderr'] = f'Execution timeout after {timeout} seconds'
            result['exit_code'] = 124
        except FileNotFoundError:
            result['stderr'] = 'g++ compiler not found in container'
            result['exit_code'] = 1
        except Exception as e:
            result['stderr'] = str(e)
            result['exit_code'] = 1
        finally:
            for p in (src, exe):
                if os.path.exists(p):
                    os.unlink(p)
        result['runtime_ms'] = int((time.time() - start_time) * 1000)
        return result

    def _run_local_java(self, code: str, input_data: str, timeout: int) -> Dict:
        import subprocess, tempfile, re
        result = {'stdout': '', 'stderr': '', 'exit_code': 0, 'runtime_ms': 0, 'memory_kb': None}

        # Extract public class name
        match = re.search(r'public\s+class\s+(\w+)', code)
        class_name = match.group(1) if match else 'Solution'

        tmpdir = tempfile.mkdtemp()
        src = os.path.join(tmpdir, f'{class_name}.java')
        with open(src, 'w') as f:
            f.write(code)

        start_time = time.time()
        try:
            comp = subprocess.run(['javac', src], capture_output=True, text=True, timeout=timeout)
            if comp.returncode != 0:
                result['stderr'] = comp.stderr
                result['exit_code'] = comp.returncode
                return result
            proc = subprocess.Popen(['java', '-cp', tmpdir, class_name], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            stdout, stderr = proc.communicate(input=input_data, timeout=timeout)
            result['stdout'] = stdout
            result['stderr'] = stderr
            result['exit_code'] = proc.returncode
        except subprocess.TimeoutExpired:
            result['stderr'] = f'Execution timeout after {timeout} seconds'
            result['exit_code'] = 124
        except FileNotFoundError:
            result['stderr'] = 'javac/java not found in container'
            result['exit_code'] = 1
        except Exception as e:
            result['stderr'] = str(e)
            result['exit_code'] = 1
        finally:
            import shutil
            shutil.rmtree(tmpdir, ignore_errors=True)
        result['runtime_ms'] = int((time.time() - start_time) * 1000)
        return result

    def _run_local_javascript(self, code: str, input_data: str, timeout: int) -> Dict:
        import subprocess, tempfile
        result = {'stdout': '', 'stderr': '', 'exit_code': 0, 'runtime_ms': 0, 'memory_kb': None}

        with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False) as f:
            f.write(code)
            code_file = f.name

        start_time = time.time()
        try:
            proc = subprocess.Popen(['node', code_file], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            stdout, stderr = proc.communicate(input=input_data, timeout=timeout)
            result['stdout'] = stdout
            result['stderr'] = stderr
            result['exit_code'] = proc.returncode
        except subprocess.TimeoutExpired:
            result['stderr'] = f'Execution timeout after {timeout} seconds'
            result['exit_code'] = 124
        except FileNotFoundError:
            result['stderr'] = 'node not found in container'
            result['exit_code'] = 1
        except Exception as e:
            result['stderr'] = str(e)
            result['exit_code'] = 1
        finally:
            if os.path.exists(code_file):
                os.unlink(code_file)
        result['runtime_ms'] = int((time.time() - start_time) * 1000)
        return result


def compare_outputs(student_output: str, expected_output: str) -> bool:
    """Compare student output with expected output."""
    runner = CodeRunner()
    normalized_student = runner.normalize_output(student_output)
    normalized_expected = runner.normalize_output(expected_output)
    return normalized_student == normalized_expected
