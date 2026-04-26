from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, Q, Avg
from accounts.permissions import IsTeacher
from .models import ClassRoom, ClassMembership
from .serializers import ClassRoomSerializer, ClassMembershipSerializer, JoinClassSerializer
from .permissions import IsClassOwner, IsClassMember
from tasks.models import Task
from submissions.models import Submission


class ClassRoomViewSet(viewsets.ModelViewSet):
    """ViewSet for ClassRoom model."""
    
    serializer_class = ClassRoomSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_teacher:
            # Teachers see their own classes
            return ClassRoom.objects.filter(teacher=user).annotate(
                student_count=Count('memberships'),
                task_count=Count('tasks')
            )
        else:
            # Students see classes they're members of
            return ClassRoom.objects.filter(memberships__student=user).annotate(
                student_count=Count('memberships'),
                task_count=Count('tasks')
            )
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'regenerate_code']:
            return [IsAuthenticated(), IsTeacher()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsClassOwner])
    def regenerate_code(self, request, pk=None):
        """Regenerate class code."""
        classroom = self.get_object()
        new_code = classroom.regenerate_code()
        return Response({'class_code': new_code}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, IsClassMember])
    def leaderboard(self, request, pk=None):
        """Get leaderboard for a class."""
        classroom = self.get_object()
        
        # Check permissions
        if not (classroom.teacher == request.user or 
                classroom.memberships.filter(student=request.user).exists()):
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get all tasks in this class
        tasks = Task.objects.filter(classroom=classroom)
        
        # Calculate scores per student
        leaderboard_data = Submission.objects.filter(
            task__classroom=classroom
        ).values(
            'student__id',
            'student__email',
            'student__username'
        ).annotate(
            total_score=Sum('score'),
            submission_count=Count('id'),
            passed_count=Count('id', filter=Q(status='passed'))
        ).order_by('-total_score')
        
        return Response({
            'classroom': ClassRoomSerializer(classroom).data,
            'leaderboard': list(leaderboard_data)
        })
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, IsClassOwner])
    def analytics(self, request, pk=None):
        """Get analytics for a class (teacher only)."""
        classroom = self.get_object()
        
        if classroom.teacher != request.user:
            return Response({'detail': 'Only teachers can view analytics.'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        tasks = Task.objects.filter(classroom=classroom)
        submissions = Submission.objects.filter(task__classroom=classroom)
        
        analytics = {
            'classroom': ClassRoomSerializer(classroom).data,
            'total_students': classroom.memberships.count(),
            'total_tasks': tasks.count(),
            'total_submissions': submissions.count(),
            'average_score': submissions.aggregate(avg=Avg('score'))['avg'] or 0,
            'submission_status_breakdown': {
                'pending': submissions.filter(status='pending').count(),
                'running': submissions.filter(status='running').count(),
                'passed': submissions.filter(status='passed').count(),
                'failed': submissions.filter(status='failed').count(),
                'error': submissions.filter(status='error').count(),
            },
            'tasks': []
        }
        
        for task in tasks:
            task_submissions = submissions.filter(task=task)
            analytics['tasks'].append({
                'id': task.id,
                'title': task.title,
                'submission_count': task_submissions.count(),
                'average_score': task_submissions.aggregate(avg=Avg('score'))['avg'] or 0,
                'pass_rate': (task_submissions.filter(status='passed').count() / 
                            max(task_submissions.count(), 1)) * 100
            })
        
        return Response(analytics)


class JoinClassViewSet(viewsets.ViewSet):
    """ViewSet for joining a class."""
    
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def join(self, request):
        """Join a class using class code."""
        serializer = JoinClassSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        membership = serializer.save()
        
        return Response(
            ClassMembershipSerializer(membership).data,
            status=status.HTTP_201_CREATED
        )
