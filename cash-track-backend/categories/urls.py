from django.urls import path
from .views import (
    CategoryListCreateView,
    CategoryDetailView,
    category_stats_view,
)

urlpatterns = [
    path("", CategoryListCreateView.as_view(), name="category-list-create"),
    path("<int:pk>/", CategoryDetailView.as_view(), name="category-detail"),
    path("stats/", category_stats_view, name="category-stats"),
]

