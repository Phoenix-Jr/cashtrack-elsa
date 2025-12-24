from django.urls import path
from .views import (
    TransactionListCreateView,
    TransactionDetailView,
    transaction_stats_view,
    dashboard_stats_view,
    analytics_view,
    transaction_history_view,
)

urlpatterns = [
    path("", TransactionListCreateView.as_view(), name="transaction-list-create"),
    # Specific routes must come before parameterized routes
    path("stats/", transaction_stats_view, name="transaction-stats"),
    path("dashboard-stats/", dashboard_stats_view, name="dashboard-stats"),
    path("analytics/", analytics_view, name="transaction-analytics"),
    path("history/", transaction_history_view, name="transaction-history"),
    # Parameterized routes come last
    path("<int:pk>/", TransactionDetailView.as_view(), name="transaction-detail"),
]

