from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import SubmissionViewSet

router = SimpleRouter(trailing_slash='/?')
router.register(r'', SubmissionViewSet, basename='submission')

urlpatterns = [
    path('', include(router.urls)),
]
