from django.contrib import admin
from .models import ClassRoom, ClassMembership


@admin.register(ClassRoom)
class ClassRoomAdmin(admin.ModelAdmin):
    list_display = ['name', 'class_code', 'teacher', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'class_code', 'teacher__email']
    readonly_fields = ['class_code', 'created_at']


@admin.register(ClassMembership)
class ClassMembershipAdmin(admin.ModelAdmin):
    list_display = ['student', 'classroom', 'joined_at']
    list_filter = ['joined_at', 'classroom']
    search_fields = ['student__email', 'classroom__name']
