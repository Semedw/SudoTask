from rest_framework import permissions
from .models import Submission


class IsSubmissionOwner(permissions.BasePermission):
    """Permission check for submission ownership."""
    
    def has_object_permission(self, request, view, obj):
        # Student can view their own submissions
        if obj.student == request.user:
            return True
        
        # Teacher can view submissions in their classes
        if request.user.is_teacher and obj.task.classroom.teacher == request.user:
            return True
        
        return False


class CanSubmitCode(permissions.BasePermission):
    """Permission check for submitting code."""
    
    def has_permission(self, request, view):
        # Only students can submit code
        return request.user and request.user.is_authenticated and request.user.is_student
