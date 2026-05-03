from django.urls import path, include, re_path
from rest_framework.routers import SimpleRouter
from .views import ClassRoomViewSet, JoinClassViewSet

router = SimpleRouter(trailing_slash='/?')
router.register(r'', ClassRoomViewSet, basename='classroom')

urlpatterns = [
    path('join/', JoinClassViewSet.as_view({'post': 'join'}), name='join-class'),
    re_path(r'^join/?$', JoinClassViewSet.as_view({'post': 'join'})),
    path('', include(router.urls)),
]
