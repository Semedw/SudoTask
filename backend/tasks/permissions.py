from rest_framework import permissions
from .models import Task
from classroom.models import ClassRoom


class IsTaskOwner(permissions.BasePermission):
    """Permission check for task ownership (teacher of the class)."""
    
    def has_object_permission(self, request, view, obj):
        return obj.classroom.teacher == request.user


class IsTaskClassMember(permissions.BasePermission):
    """Permission check for class membership (teacher or student)."""
    
    def has_object_permission(self, request, view, obj):
        classroom = obj.classroom if hasattr(obj, 'classroom') else obj
        
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
