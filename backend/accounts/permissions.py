from rest_framework import permissions


class IsTeacher(permissions.BasePermission):
    """Permission check for teacher role."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_teacher


class IsStudent(permissions.BasePermission):
    """Permission check for student role."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_student


class IsTeacherOrReadOnly(permissions.BasePermission):
    """Allow read-only access to students, write access to teachers."""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.is_teacher
