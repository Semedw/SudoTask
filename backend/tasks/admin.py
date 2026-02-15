from django.contrib import admin
from .models import Task, Criteria, TestCase


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'classroom', 'difficulty', 'created_at', 'deadline']
    list_filter = ['difficulty', 'created_at', 'deadline']
    search_fields = ['title', 'description', 'classroom__name']
    readonly_fields = ['created_at']


@admin.register(Criteria)
class CriteriaAdmin(admin.ModelAdmin):
    list_display = ['name', 'task', 'points']
    list_filter = ['task']
    search_fields = ['name', 'task__title']


@admin.register(TestCase)
class TestCaseAdmin(admin.ModelAdmin):
    list_display = ['task', 'order', 'is_hidden', 'weight_points']
    list_filter = ['is_hidden', 'task']
    search_fields = ['task__title']
