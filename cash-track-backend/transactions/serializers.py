from rest_framework import serializers
from .models import Transaction
from categories.serializers import CategorySerializer
from accounts.serializers import UserSerializer


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for Transaction model"""
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    created_by = serializers.SerializerMethodField()
    modified_by = serializers.SerializerMethodField()
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    ref = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    exporter_fournisseur = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    balance = serializers.SerializerMethodField()
    
    class Meta:
        model = Transaction
        fields = [
            "id",
            "type",
            "description",
            "amount",
            "ref",
            "exporter_fournisseur",
            "category",
            "category_id",
            "balance",
            "created_by",
            "created_at",
            "modified_by",
            "updated_at",
        ]
        read_only_fields = ["id", "balance", "created_by", "created_at", "modified_by", "updated_at"]
    
    def get_created_by(self, obj):
        """Return user info or 'Utilisateur supprimé' if null"""
        if obj.created_by is None:
            return {
                "id": None,
                "email": None,
                "name": None,
                "role": None,
                "status": None,
                "created_at": None,
                "is_superuser": False
            }
        return UserSerializer(obj.created_by).data
    
    def get_modified_by(self, obj):
        """Return user info or 'Utilisateur supprimé' if null"""
        if obj.modified_by is None:
            return None
        return UserSerializer(obj.modified_by).data
    
    def get_balance(self, obj):
        """Calculate cumulative balance up to this transaction"""
        from django.db.models import Sum, Q
        from decimal import Decimal
        
        # Calculate balance from all transactions up to and including this one
        # Order by created_at to ensure consistent ordering
        transactions_up_to = Transaction.objects.filter(
            created_at__lte=obj.created_at
        )
        
        total_recettes = transactions_up_to.filter(type="recette").aggregate(
            total=Sum("amount")
        )["total"] or Decimal('0')
        
        total_depenses = abs(transactions_up_to.filter(type="depense").aggregate(
            total=Sum("amount")
        )["total"] or Decimal('0'))
        
        # Convert to float for calculations
        total_recettes = float(total_recettes)
        total_depenses = float(total_depenses)
        
        # Add current transaction amount
        if obj.type == "recette":
            total_recettes += float(obj.amount)
        else:
            total_depenses += abs(float(obj.amount))
        
        return float(total_recettes - total_depenses)
    
    def create(self, validated_data):
        category_id = validated_data.pop("category_id", None)
        request = self.context.get("request")
        
        if category_id:
            from categories.models import Category
            try:
                validated_data["category"] = Category.objects.get(id=category_id)
            except Category.DoesNotExist:
                pass
        
        if request and request.user:
            validated_data["created_by"] = request.user
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        category_id = validated_data.pop("category_id", None)
        request = self.context.get("request")
        
        if category_id is not None:
            if category_id:
                from categories.models import Category
                try:
                    validated_data["category"] = Category.objects.get(id=category_id)
                except Category.DoesNotExist:
                    validated_data["category"] = None
            else:
                validated_data["category"] = None
        
        if request and request.user:
            validated_data["modified_by"] = request.user
        
        return super().update(instance, validated_data)

