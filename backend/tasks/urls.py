from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, CriteriaViewSet, TestCaseViewSet

router = DefaultRouter()
router.register(r'', TaskViewSet, basename='task')
router.register(r'criteria', CriteriaViewSet, basename='criteria')
router.register(r'testcases', TestCaseViewSet, basename='testcase')

# Define a wrapper to load the submission view ONLY when needed
def get_submission_view(request, *args, **kwargs):
    from submissions.views import SubmissionViewSet
    view = SubmissionViewSet.as_view({'post': 'submit'})
    return view(request, *args, **kwargs)

urlpatterns = [
    path('', include(router.urls)),
    # Use the wrapper function instead of a direct view import
    path('<int:task_id>/submit/', get_submission_view, name='task-submit'),
]