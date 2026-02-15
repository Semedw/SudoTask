from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClassRoomViewSet, JoinClassViewSet

router = DefaultRouter()
router.register(r'', ClassRoomViewSet, basename='classroom')

urlpatterns = [
    path('', include(router.urls)),
    path('join/', JoinClassViewSet.as_view({'post': 'join'}), name='join-class'),
]
