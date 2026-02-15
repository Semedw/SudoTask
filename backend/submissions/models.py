from django.db import models
from accounts.models import User
from tasks.models import Task, TestCase


class Submission(models.Model):
    """Submission model for student code submissions."""
    
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        RUNNING = 'running', 'Running'
        PASSED = 'passed', 'Passed'
        FAILED = 'failed', 'Failed'
        ERROR = 'error', 'Error'
    
    class Language(models.TextChoices):
        PYTHON = 'python', 'Python'
        CPP = 'cpp', 'C++'
        JAVA = 'java', 'Java'
    
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions')
    language = models.CharField(max_length=10, choices=Language.choices, default=Language.PYTHON)
    code = models.TextField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    score = models.IntegerField(default=0)
    passed_count = models.IntegerField(default=0)
    total_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    execution_time_ms = models.IntegerField(null=True, blank=True)
    memory_kb = models.IntegerField(null=True, blank=True)
    stdout = models.TextField(blank=True)
    stderr = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.student.email} - {self.task.title} ({self.status})"


class SubmissionTestResult(models.Model):
    """Test result for each testcase in a submission."""
    
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE, related_name='test_results')
    testcase = models.ForeignKey(TestCase, on_delete=models.CASCADE, related_name='test_results')
    passed = models.BooleanField(default=False)
    student_output = models.TextField(blank=True)
    expected_output = models.TextField(blank=True)
    stderr = models.TextField(blank=True)
    runtime_ms = models.IntegerField(null=True, blank=True)
    
    class Meta:
        unique_together = [['submission', 'testcase']]
    
    def __str__(self):
        status = "PASS" if self.passed else "FAIL"
        return f"{self.submission} - Test {self.testcase.order} ({status})"
