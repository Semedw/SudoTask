from rest_framework import serializers
from accounts.serializers import UserSerializer
from tasks.serializers import TaskSerializer, TestCaseSerializer
from .models import Submission, SubmissionTestResult


class SubmissionTestResultSerializer(serializers.ModelSerializer):
    """Serializer for SubmissionTestResult model."""
    
    testcase = TestCaseSerializer(read_only=True)
    
    class Meta:
        model = SubmissionTestResult
        fields = ['id', 'testcase', 'passed', 'student_output', 'expected_output', 
                  'stderr', 'runtime_ms']
        read_only_fields = ['id']


class SubmissionSerializer(serializers.ModelSerializer):
    """Serializer for Submission model."""
    
    task = TaskSerializer(read_only=True)
    student = UserSerializer(read_only=True)
    test_results = SubmissionTestResultSerializer(many=True, read_only=True)
    
    class Meta:
        model = Submission
        fields = ['id', 'task', 'student', 'language', 'code', 'status', 'score', 
                  'passed_count', 'total_count', 'created_at', 'execution_time_ms', 
                  'memory_kb', 'stdout', 'stderr', 'test_results']
        read_only_fields = ['id', 'student', 'status', 'score', 'passed_count', 
                          'total_count', 'created_at', 'execution_time_ms', 
                          'memory_kb', 'stdout', 'stderr', 'test_results']


class SubmitCodeSerializer(serializers.Serializer):
    """Serializer for code submission."""
    
    code = serializers.CharField(required=True)
    language = serializers.ChoiceField(
        choices=Submission.Language.choices,
        default=Submission.Language.PYTHON
    )
    
    def validate_code(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Code cannot be empty.")
        return value
