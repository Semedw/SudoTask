"""
Secure code execution runner using Docker.
"""
import os
import re
import time
import tempfile
import docker
from django.conf import settings
from typing import Dict


class CodeRunner:
    """Secure code runner using Docker containers."""

    def __init__(self):
        self.client = None
        try:
            self.client = docker.from_env()
        except Exception:
            self.client = None

    def run_python(self, code: str, input_data: str, timeout: int = None) -> Dict:
        return self.run_code(code=code, language='python', input_data=input_data, timeout=timeout)

    def run_code(self, code: str, language: str, input_data: str, timeout: int = None) -> Dict:
        timeout = timeout or getattr(settings, 'JUDGE_TIMEOUT_SECONDS', 2)
        if not self.client:
            return {
                'stdout': '',
                'stderr': 'Docker executor is unavailable.',
                'exit_code': 1,
                'runtime_ms': 0,
                'memory_kb': None,
            }

        memory_limit = getattr(settings, 'JUDGE_MEMORY_LIMIT_MB', 256)
        cpu_quota = int(100000 * float(getattr(settings, 'JUDGE_CPU_LIMIT', '0.5')))

        images = {
            'python': getattr(settings, 'JUDGE_PYTHON_IMAGE', getattr(settings, 'JUDGE_DOCKER_IMAGE', 'python:3.11-slim')),
            'cpp': getattr(settings, 'JUDGE_CPP_IMAGE', 'gcc:13'),
            'java': getattr(settings, 'JUDGE_JAVA_IMAGE', 'eclipse-temurin:17'),
        }

        if language == 'python':
            code_filename = 'code.py'
            command = 'python /workspace/code.py < /workspace/input.txt'
        elif language == 'cpp':
            code_filename = 'main.cpp'
            command = 'g++ /workspace/main.cpp -O2 -o /tmp/a.out && /tmp/a.out < /workspace/input.txt'
        elif language == 'java':
            class_name = self._extract_java_class_name(code)
            code_filename = f'{class_name}.java'
            command = f'javac /workspace/{class_name}.java -d /tmp && java -cp /tmp {class_name} < /workspace/input.txt'
        else:
            return {
                'stdout': '',
                'stderr': f'Unsupported language: {language}',
                'exit_code': 1,
                'runtime_ms': 0,
                'memory_kb': None,
            }

        image = images[language]

        with tempfile.TemporaryDirectory() as workdir:
            code_path = os.path.join(workdir, code_filename)
            input_path = os.path.join(workdir, 'input.txt')

            with open(code_path, 'w', encoding='utf-8') as f:
                f.write(code)
            with open(input_path, 'w', encoding='utf-8') as f:
                f.write(input_data or '')

            start_time = time.time()
            try:
                container_output = self.client.containers.run(
                    image=image,
                    command=['sh', '-c', command],
                    mem_limit=f'{memory_limit}m',
                    memswap_limit=f'{memory_limit}m',
                    cpu_period=100000,
                    cpu_quota=cpu_quota,
                    network_disabled=True,
                    remove=True,
                    detach=False,
                    volumes={
                        workdir: {'bind': '/workspace', 'mode': 'rw'}
                    },
                    working_dir='/workspace',
                    timeout=timeout,
                )

                runtime_ms = int((time.time() - start_time) * 1000)
                stdout = container_output.decode('utf-8', errors='replace') if isinstance(container_output, bytes) else str(container_output or '')
                return {
                    'stdout': stdout,
                    'stderr': '',
                    'exit_code': 0,
                    'runtime_ms': runtime_ms,
                    'memory_kb': None,
                }

            except docker.errors.ContainerError as e:
                runtime_ms = int((time.time() - start_time) * 1000)
                return {
                    'stdout': e.stdout.decode('utf-8', errors='replace') if e.stdout else '',
                    'stderr': e.stderr.decode('utf-8', errors='replace') if e.stderr else str(e),
                    'exit_code': e.exit_status,
                    'runtime_ms': runtime_ms,
                    'memory_kb': None,
                }
            except docker.errors.Timeout as e:
                return {
                    'stdout': '',
                    'stderr': f'Execution timeout: {e}',
                    'exit_code': 124,
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

    @staticmethod
    def _extract_java_class_name(code: str) -> str:
        match = re.search(r'public\s+class\s+(\w+)', code or '')
        return match.group(1) if match else 'Main'

    def normalize_output(self, output: str) -> str:
        """Normalize output for comparison (trim whitespace, normalize newlines)."""
        return '\n'.join(line.rstrip() for line in (output or '').strip().splitlines())


def compare_outputs(student_output: str, expected_output: str) -> bool:
    """Compare student output with expected output."""
    runner = CodeRunner()
    normalized_student = runner.normalize_output(student_output)
    normalized_expected = runner.normalize_output(expected_output)
    return normalized_student == normalized_expected
