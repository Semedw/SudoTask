from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import TaskViewSet, CriteriaViewSet, TestCaseViewSet

# Register testcases and criteria on their own routers so that the
# empty-prefix TaskViewSet doesn't swallow their paths.
criteria_router = SimpleRouter()
criteria_router.register(r'criteria', CriteriaViewSet, basename='criteria')

testcase_router = SimpleRouter()
testcase_router.register(r'testcases', TestCaseViewSet, basename='testcase')

task_router = SimpleRouter()
task_router.register(r'', TaskViewSet, basename='task')

from django.views.decorators.csrf import csrf_exempt

# Define a wrapper to load the submission view ONLY when needed
@csrf_exempt
def get_submission_view(request, *args, **kwargs):
    from submissions.views import SubmissionViewSet
    view = SubmissionViewSet.as_view({'post': 'submit'})
    return view(request, *args, **kwargs)

@csrf_exempt
def get_test_view(request, *args, **kwargs):
    from submissions.views import SubmissionViewSet
    view = SubmissionViewSet.as_view({'post': 'test'})
    return view(request, *args, **kwargs)

urlpatterns = [
    # Put specific prefixes BEFORE the catch-all task router
    path('', include(criteria_router.urls)),
    path('', include(testcase_router.urls)),
    path('', include(task_router.urls)),
    path('<int:task_id>/submit/', get_submission_view, name='task-submit'),
    path('<int:task_id>/test/', get_test_view, name='task-test'),
]