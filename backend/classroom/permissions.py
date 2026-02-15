from rest_framework import permissions
from .models import ClassRoom


class IsClassOwner(permissions.BasePermission):
    """Permission check for class ownership."""
    
    def has_object_permission(self, request, view, obj):
        return obj.teacher == request.user


class IsClassMember(permissions.BasePermission):
    """Permission check for class membership."""
    
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'classroom'):
            classroom = obj.classroom
        elif hasattr(obj, 'task'):
            classroom = obj.task.classroom
        else:
            classroom = obj
        
        # Teacher can access their own classes
        if classroom.teacher == request.user:
            return True
        
        # Student can access if they're a member
        if request.user.is_student:
            return ClassRoom.objects.filter(
                id=classroom.id,
                memberships__student=request.user
            ).exists()
        
        return False


class IsClassOwnerOrMember(permissions.BasePermission):
    """Permission check for class owner or member."""
    
    def has_object_permission(self, request, view, obj):
        classroom = obj if isinstance(obj, ClassRoom) else obj.classroom
        
        # Teacher owner
        if classroom.teacher == request.user:
            return True
        
        # Student member
        if request.user.is_student:
            return ClassRoom.objects.filter(
                id=classroom.id,
                memberships__student=request.user
            ).exists()
        
        return False
