from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count
from .models import Category
from .serializers import CategorySerializer
from .permissions import IsAdminRole
from transactions.models import Transaction


class CategoryListCreateView(generics.ListCreateAPIView):
    """List and create categories"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        Only admins can create categories.
        """
        if self.request.method == 'POST':
            return [IsAdminRole()]
        return [IsAuthenticated()]


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a category"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        Only admins can update or delete categories.
        """
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdminRole()]
        return [IsAuthenticated()]


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def category_stats_view(request):
    """Get category statistics with transaction counts and percentages"""
    # Get all categories with transaction counts
    categories = Category.objects.annotate(
        transaction_count=Count('transactions')
    ).order_by('-transaction_count', 'name')
    
    # Get total number of transactions
    total_transactions = Transaction.objects.count()
    
    # Build response with stats
    categories_data = []
    for category in categories:
        count = category.transaction_count
        percentage = 0
        if total_transactions > 0:
            percentage = round((count / total_transactions) * 100, 1)
        
        category_data = CategorySerializer(category).data
        category_data['transaction_count'] = count
        category_data['percentage'] = percentage
        categories_data.append(category_data)
    
    # Also include categories with 0 transactions
    categories_with_transactions = {cat.id for cat in categories}
    all_categories = Category.objects.all()
    for category in all_categories:
        if category.id not in categories_with_transactions:
            category_data = CategorySerializer(category).data
            category_data['transaction_count'] = 0
            category_data['percentage'] = 0.0
            categories_data.append(category_data)
    
    return Response({
        "count": len(categories_data),
        "total_transactions": total_transactions,
        "categories": categories_data,
    })
