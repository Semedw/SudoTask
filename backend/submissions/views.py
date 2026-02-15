from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Submission
from .serializers import SubmissionSerializer, SubmitCodeSerializer
from .permissions import IsSubmissionOwner, CanSubmitCode
from tasks.models import Task
from judge.tasks import execute_submission


class SubmissionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Submission model."""
    
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        task_id = self.request.query_params.get('task_id', None)
        
        queryset = Submission.objects.all()
        
        if task_id:
            queryset = queryset.filter(task_id=task_id)
        
        if user.is_teacher:
            # Teachers see all submissions in their classes
            queryset = queryset.filter(task__classroom__teacher=user)
        else:
            # Students see only their own submissions
            queryset = queryset.filter(student=user)
        
        return queryset.select_related('task', 'student').prefetch_related('test_results__testcase')
    
    def get_permissions(self):
        if hasattr(self, 'action') and self.action == 'submit':
            return [IsAuthenticated(), CanSubmitCode()]
        return [IsAuthenticated(), IsSubmissionOwner()]
    
    @action(detail=False, methods=['post'], url_path='tasks/(?P<task_id>[^/.]+)/submit')
    def submit(self, request, task_id=None):
        """Submit code for a task."""
        # Get task_id from URL or request data
        if not task_id:
            task_id = request.data.get('task_id')
            if not task_id:
                # Try to get from URL kwargs
                task_id = request.resolver_match.kwargs.get('task_id')
        
        if not task_id:
            return Response(
                {'detail': 'task_id is required.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        task = get_object_or_404(Task, id=task_id)
        
        # Check if student is a member of the class
        if not (task.classroom.memberships.filter(student=request.user).exists() or 
                task.classroom.teacher == request.user):
            return Response(
                {'detail': 'You are not a member of this class.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = SubmitCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create submission
        submission = Submission.objects.create(
            task=task,
            student=request.user,
            code=serializer.validated_data['code'],
            language=serializer.validated_data['language'],
            status=Submission.Status.PENDING
        )
        
        # Queue execution task
        execute_submission.delay(submission.id)
        
        return Response(
            SubmissionSerializer(submission).data,
            status=status.HTTP_201_CREATED
        )
