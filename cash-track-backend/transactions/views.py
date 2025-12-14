from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q, Sum, Count
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal
from .models import Transaction
from .serializers import TransactionSerializer
from .permissions import IsAdminRole, IsOwnerOrAdmin, IsNotReadOnly
from .pagination import TransactionPagination


class TransactionListCreateView(generics.ListCreateAPIView):
    """List and create transactions"""
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = TransactionPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["description", "ref", "exporter_fournisseur", "category__name"]
    ordering_fields = ["date", "amount", "created_at"]
    ordering = ["-created_at", "-updated_at"]
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        Readonly users can only list, not create.
        """
        if self.request.method == 'POST':
            return [IsNotReadOnly()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        queryset = Transaction.objects.select_related("category", "created_by", "modified_by").all()
        
        # Filter by type
        transaction_type = self.request.query_params.get("type")
        if transaction_type in ["recette", "depense"]:
            queryset = queryset.filter(type=transaction_type)
        
        # Filter by category
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category__name=category)
        
        # Filter by author
        author = self.request.query_params.get("author")
        if author:
            queryset = queryset.filter(created_by__name__icontains=author)
        
        # Filter by creation date range (created_at)
        created_at_from = self.request.query_params.get("created_at_from")
        created_at_to = self.request.query_params.get("created_at_to")
        if created_at_from:
            queryset = queryset.filter(created_at__gte=created_at_from)
        if created_at_to:
            # Include the full day by setting time to end of day
            try:
                end_date = datetime.strptime(created_at_to, "%Y-%m-%d").date()
                end_datetime = timezone.make_aware(datetime.combine(end_date, datetime.max.time()))
                queryset = queryset.filter(created_at__lte=end_datetime)
            except ValueError:
                queryset = queryset.filter(created_at__lte=created_at_to)
        
        # Filter by update date range (updated_at)
        updated_at_from = self.request.query_params.get("updated_at_from")
        updated_at_to = self.request.query_params.get("updated_at_to")
        if updated_at_from:
            queryset = queryset.filter(updated_at__gte=updated_at_from)
        if updated_at_to:
            try:
                end_date = datetime.strptime(updated_at_to, "%Y-%m-%d").date()
                end_datetime = timezone.make_aware(datetime.combine(end_date, datetime.max.time()))
                queryset = queryset.filter(updated_at__lte=end_datetime)
            except ValueError:
                queryset = queryset.filter(updated_at__lte=updated_at_to)
        
        # Filter by amount range
        amount_min = self.request.query_params.get("amount_min")
        amount_max = self.request.query_params.get("amount_max")
        if amount_min:
            queryset = queryset.filter(amount__gte=amount_min)
        if amount_max:
            queryset = queryset.filter(amount__lte=amount_max)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class TransactionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a transaction"""
    queryset = Transaction.objects.select_related("category", "created_by", "modified_by")
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        Users can update their own transactions, admins can update/delete all.
        """
        if self.request.method in ['PUT', 'PATCH']:
            return [IsOwnerOrAdmin()]
        elif self.request.method == 'DELETE':
            return [IsAdminRole()]
        return [IsAuthenticated()]
    
    def perform_update(self, serializer):
        serializer.save(modified_by=self.request.user)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def transaction_stats_view(request):
    """Get transaction statistics"""
    date_from = request.query_params.get("date_from")
    date_to = request.query_params.get("date_to")
    
    queryset = Transaction.objects.all()
    # Note: date_from and date_to are deprecated, use created_at_from and created_at_to instead
    
    total_recettes = queryset.filter(type="recette").aggregate(
        total=Sum("amount")
    )["total"] or 0
    
    total_depenses = abs(queryset.filter(type="depense").aggregate(
        total=Sum("amount")
    )["total"] or 0)
    
    current_balance = Transaction.get_current_balance()
    transaction_count = queryset.count()
    
    return Response({
        "current_balance": float(current_balance),
        "total_recettes": float(total_recettes),
        "total_depenses": float(total_depenses),
        "transaction_count": transaction_count,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_stats_view(request):
    """Get dashboard statistics"""
    today = timezone.now().date()
    
    # Today's stats
    # Get today's transactions based on created_at
    today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = timezone.now().replace(hour=23, minute=59, second=59, microsecond=999999)
    
    today_recettes = Transaction.objects.filter(
        type="recette",
        created_at__gte=today_start,
        created_at__lte=today_end
    ).aggregate(total=Sum("amount"))["total"] or 0
    
    today_depenses = abs(Transaction.objects.filter(
        type="depense",
        created_at__gte=today_start,
        created_at__lte=today_end
    ).aggregate(total=Sum("amount"))["total"] or 0)
    
    # Overall stats
    current_balance = Transaction.get_current_balance()
    total_recettes = Transaction.get_total_recettes()
    total_depenses = Transaction.get_total_depenses()
    transaction_count = Transaction.objects.count()
    
    return Response({
        "current_balance": float(current_balance),
        "total_recettes": float(total_recettes),
        "total_depenses": float(total_depenses),
        "transaction_count": transaction_count,
        "today_recettes": float(today_recettes),
        "today_depenses": float(today_depenses),
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def analytics_view(request):
    """Get detailed analytics data for charts"""
    date_from = request.query_params.get("date_from")
    date_to = request.query_params.get("date_to")
    
    # Default to last 30 days if no date range provided
    if not date_from or not date_to:
        end_date = timezone.now()
        start_date = end_date - timedelta(days=30)
        date_from = start_date.isoformat()
        date_to = end_date.isoformat()
    
    queryset = Transaction.objects.select_related("category").filter(
        created_at__gte=date_from,
        created_at__lte=date_to
    )
    
    # Daily data for area chart (grouped by created_at date)
    daily_data = {}
    transactions = queryset.values("created_at", "type", "amount")
    
    for txn in transactions:
        date_str = txn["created_at"].date().strftime("%Y-%m-%d")
        if date_str not in daily_data:
            daily_data[date_str] = {"date": date_str, "recettes": 0, "depenses": 0}
        
        if txn["type"] == "recette":
            daily_data[date_str]["recettes"] += float(txn["amount"])
        else:
            daily_data[date_str]["depenses"] += abs(float(txn["amount"]))
    
    # Sort by date
    area_data = sorted(daily_data.values(), key=lambda x: x["date"])
    
    # Category distribution for bar chart
    category_stats = queryset.values("category__name", "category__color", "type").annotate(
        total=Sum("amount")
    )
    
    category_data = {}
    for stat in category_stats:
        cat_name = stat["category__name"] or "Non catégorisé"
        cat_color = stat["category__color"] or "#64748B"
        
        if cat_name not in category_data:
            category_data[cat_name] = {
                "name": cat_name,
                "color": cat_color,
                "recettes": 0,
                "depenses": 0,
            }
        
        if stat["type"] == "recette":
            category_data[cat_name]["recettes"] += float(stat["total"] or 0)
        else:
            category_data[cat_name]["depenses"] += abs(float(stat["total"] or 0))
    
    # Format category data for bar chart (showing total amount per category)
    category_chart_data = []
    for cat_name, data in category_data.items():
        total = data["recettes"] + data["depenses"]
        if total > 0:
            category_chart_data.append({
                "name": cat_name,
                "value": total,
                "color": data["color"],
                "recettes": data["recettes"],
                "depenses": data["depenses"],
            })
    
    # Sort by value descending
    category_chart_data.sort(key=lambda x: x["value"], reverse=True)
    
    # Overall stats
    total_recettes = queryset.filter(type="recette").aggregate(
        total=Sum("amount")
    )["total"] or 0
    
    total_depenses = abs(queryset.filter(type="depense").aggregate(
        total=Sum("amount")
    )["total"] or 0)
    
    current_balance = Transaction.get_current_balance()
    transaction_count = queryset.count()
    
    profit_margin = 0
    if total_recettes > 0:
        profit_margin = ((float(total_recettes) - float(total_depenses)) / float(total_recettes)) * 100
    
    return Response({
        "area_data": area_data,
        "category_data": category_chart_data,
        "total_recettes": float(total_recettes),
        "total_depenses": float(total_depenses),
        "current_balance": float(current_balance),
        "transaction_count": transaction_count,
        "profit_margin": round(profit_margin, 2),
        "date_from": date_from,
        "date_to": date_to,
    })
