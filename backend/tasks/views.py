from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, Q
from accounts.permissions import IsTeacher
from .models import Task, Criteria, TestCase
from .serializers import TaskSerializer, TaskListSerializer, CriteriaSerializer, TestCaseSerializer
from .permissions import IsTaskOwner, IsTaskClassMember
from classroom.permissions import IsClassOwner
from submissions.models import Submission


class TaskViewSet(viewsets.ModelViewSet):
    """ViewSet for Task model."""
    
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        class_id = self.request.query_params.get('class_id', None)
        
        queryset = Task.objects.all()
        
        if class_id:
            queryset = queryset.filter(classroom_id=class_id)
        
        if user.is_teacher:
            # Teachers see tasks in their classes
            queryset = queryset.filter(classroom__teacher=user)
        else:
            # Students see tasks in classes they're members of
            queryset = queryset.filter(classroom__memberships__student=user)
        
        return queryset.select_related('classroom').prefetch_related('testcases', 'criteria')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return TaskListSerializer
        return TaskSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsTeacher()]
        return [IsAuthenticated(), IsTaskClassMember()]
    
    def perform_create(self, serializer):
        classroom = serializer.validated_data['classroom']
        if classroom.teacher != self.request.user:
            raise PermissionError("You can only create tasks in your own classes.")
        serializer.save()
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, IsTaskClassMember])
    def analytics(self, request, pk=None):
        """Get analytics for a task (teacher only)."""
        task = self.get_object()
        
        if task.classroom.teacher != request.user:
            return Response({'detail': 'Only teachers can view task analytics.'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        submissions = Submission.objects.filter(task=task)
        
        analytics = {
            'task': TaskSerializer(task).data,
            'total_submissions': submissions.count(),
            'unique_students': submissions.values('student').distinct().count(),
            'average_score': submissions.aggregate(avg=Sum('score'))['avg'] or 0,
            'submission_status_breakdown': {
                'pending': submissions.filter(status='pending').count(),
                'running': submissions.filter(status='running').count(),
                'passed': submissions.filter(status='passed').count(),
                'failed': submissions.filter(status='failed').count(),
                'error': submissions.filter(status='error').count(),
            },
            'testcase_performance': []
        }
        
        for testcase in task.testcases.all():
            testcase_results = task.submissions.filter(
                test_results__testcase=testcase,
                test_results__passed=True
            ).count()
            total_attempts = task.submissions.filter(
                test_results__testcase=testcase
            ).count()
            
            analytics['testcase_performance'].append({
                'testcase_id': testcase.id,
                'order': testcase.order,
                'is_hidden': testcase.is_hidden,
                'pass_count': testcase_results,
                'total_attempts': total_attempts,
                'pass_rate': (testcase_results / max(total_attempts, 1)) * 100
            })
        
        return Response(analytics)


class CriteriaViewSet(viewsets.ModelViewSet):
    """ViewSet for Criteria model."""
    
    serializer_class = CriteriaSerializer
    permission_classes = [IsAuthenticated, IsTeacher]
    
    def get_queryset(self):
        task_id = self.request.query_params.get('task_id', None)
        if task_id:
            return Criteria.objects.filter(task_id=task_id)
        return Criteria.objects.none()
    
    def perform_create(self, serializer):
        task = serializer.validated_data['task']
        if task.classroom.teacher != self.request.user:
            raise PermissionError("You can only add criteria to tasks in your own classes.")
        serializer.save()


class TestCaseViewSet(viewsets.ModelViewSet):
    """ViewSet for TestCase model."""
    
    serializer_class = TestCaseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        task_id = self.request.query_params.get('task_id', None)
        user = self.request.user
        
        queryset = TestCase.objects.all()
        
        if task_id:
            queryset = queryset.filter(task_id=task_id)
        
        # Teachers see all, students see all but with hidden expected_output filtered
        return queryset.select_related('task')
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsTeacher()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        task = serializer.validated_data['task']
        if task.classroom.teacher != self.request.user:
            raise PermissionError("You can only add testcases to tasks in your own classes.")
        serializer.save()
    
    def perform_update(self, serializer):
        task = serializer.instance.task
        if task.classroom.teacher != self.request.user:
            raise PermissionError("You can only update testcases in your own classes.")
        serializer.save()
    
    def perform_destroy(self, instance):
        if instance.task.classroom.teacher != self.request.user:
            raise PermissionError("You can only delete testcases in your own classes.")
        instance.delete()
