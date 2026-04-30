"""
URL configuration for sudotask project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/classes/', include('classroom.urls')),
    re_path(r'^api/classes/?', include('classroom.urls')),
    path('api/tasks/', include('tasks.urls')),
    re_path(r'^api/tasks/?', include('tasks.urls')),
    path('api/submissions/', include('submissions.urls')),
    re_path(r'^api/submissions/?', include('submissions.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
