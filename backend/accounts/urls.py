from django.urls import path
from .views import RegisterView, LoginView, RefreshView, LogoutView, csrf_view, me_view, update_profile_view

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('refresh/', RefreshView.as_view(), name='refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('csrf/', csrf_view, name='csrf'),
    path('me/', me_view, name='me'),
    path('me/update/', update_profile_view, name='update-profile'),
]
