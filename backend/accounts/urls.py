from django.urls import path
from .views import RegisterView, LoginView, RefreshView, LogoutView, csrf_view, me_view, update_profile_view

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('register', RegisterView.as_view()),
    path('login/', LoginView.as_view(), name='login'),
    path('login', LoginView.as_view()),
    path('refresh/', RefreshView.as_view(), name='refresh'),
    path('refresh', RefreshView.as_view()),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('logout', LogoutView.as_view()),
    path('csrf/', csrf_view, name='csrf'),
    path('csrf', csrf_view),
    path('me/', me_view, name='me'),
    path('me', me_view),
    path('me/update/', update_profile_view, name='update-profile'),
    path('me/update', update_profile_view),
]
