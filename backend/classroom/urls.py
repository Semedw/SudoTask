from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import ClassRoomViewSet, JoinClassViewSet

router = SimpleRouter()
router.register(r'', ClassRoomViewSet, basename='classroom')

urlpatterns = [
    path('join/', JoinClassViewSet.as_view({'post': 'join'}), name='join-class'),
    path('', include(router.urls)),
]
