from django.urls import path
from .views import (
    login_view,
    refresh_token_view,
    current_user_view,
    logout_view,
    UserListCreateView,
    UserDetailView,
    change_user_password_view,
    toggle_user_status_view,
)

urlpatterns = [
    path("login/", login_view, name="login"),
    path("refresh/", refresh_token_view, name="refresh"),
    path("logout/", logout_view, name="logout"),
    path("me/", current_user_view, name="current-user"),
    path("users/", UserListCreateView.as_view(), name="user-list-create"),
    path("users/<int:pk>/", UserDetailView.as_view(), name="user-detail"),
    path("users/<int:pk>/change-password/", change_user_password_view, name="user-change-password"),
    path("users/<int:pk>/toggle-status/", toggle_user_status_view, name="user-toggle-status"),
]

