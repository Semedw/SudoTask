"""
Celery tasks for code execution.
"""
import logging
from celery import shared_task
from submissions.models import Submission, SubmissionTestResult
from .runner import CodeRunner, compare_outputs

logger = logging.getLogger(__name__)


@shared_task
def execute_submission(submission_id: int):
    """
    Execute a submission against all testcases.
    
    Args:
        submission_id: ID of the Submission to execute
    """
    try:
        submission = Submission.objects.get(id=submission_id)
    except Submission.DoesNotExist:
        logger.error(f"Submission {submission_id} not found")
        return
    
    # Update status to running
    submission.status = Submission.Status.RUNNING
    submission.save()
    
    runner = CodeRunner()
    if not runner.client:
        submission.status = Submission.Status.ERROR
        submission.stderr = 'Docker executor is unavailable.'
        submission.save(update_fields=['status', 'stderr'])
        logger.error("Docker executor unavailable for submission %s", submission_id)
        return

    task = submission.task
    testcases = task.testcases.all().order_by('order')
    
    total_score = 0
    passed_count = 0
    total_count = testcases.count()
    total_runtime_ms = 0
    error_occurred = False
    
    # Execute each testcase
    for testcase in testcases:
        try:
            # Run code with testcase input in Docker only.
            result = runner.run_code(
                code=submission.code,
                language=submission.language,
                input_data=testcase.input_data,
                timeout=getattr(submission, 'timeout', 10)
            )
            
            # Compare outputs
            passed = compare_outputs(result['stdout'], testcase.expected_output)
            
            # Calculate score
            if passed:
                total_score += testcase.weight_points
                passed_count += 1
            
            # Create test result
            test_result = SubmissionTestResult.objects.create(
                submission=submission,
                testcase=testcase,
                passed=passed,
                student_output=result['stdout'],
                expected_output=testcase.expected_output if not testcase.is_hidden else '',
                stderr=result['stderr'],
                runtime_ms=result.get('runtime_ms', 0)
            )
            
            total_runtime_ms += result.get('runtime_ms', 0)
            
            # Check for errors
            if result['exit_code'] != 0 and not result['stderr']:
                error_occurred = True
            
        except Exception as e:
            logger.error(f"Error executing testcase {testcase.id} for submission {submission_id}: {e}")
            error_occurred = True
            
            # Create failed test result
            SubmissionTestResult.objects.create(
                submission=submission,
                testcase=testcase,
                passed=False,
                student_output='',
                expected_output='',
                stderr=f'Execution error: {str(e)}',
                runtime_ms=0
            )
    
    # Update submission
    submission.score = total_score
    submission.passed_count = passed_count
    submission.total_count = total_count
    submission.execution_time_ms = total_runtime_ms
    
    # Determine final status
    if error_occurred:
        submission.status = Submission.Status.ERROR
    elif passed_count == total_count:
        submission.status = Submission.Status.PASSED
    else:
        submission.status = Submission.Status.FAILED
    
    submission.save()
    
    logger.info(f"Submission {submission_id} completed: {passed_count}/{total_count} tests passed, score: {total_score}")
