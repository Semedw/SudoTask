from django.contrib import admin
from .models import Submission, SubmissionTestResult


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ['student', 'task', 'status', 'score', 'language', 'created_at']
    list_filter = ['status', 'language', 'created_at']
    search_fields = ['student__email', 'task__title']
    readonly_fields = ['created_at']


@admin.register(SubmissionTestResult)
class SubmissionTestResultAdmin(admin.ModelAdmin):
    list_display = ['submission', 'testcase', 'passed', 'runtime_ms']
    list_filter = ['passed']
    search_fields = ['submission__student__email', 'testcase__task__title']
