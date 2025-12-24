from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import Transaction, TransactionHistory
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
        
        # Validate that a dépense doesn't exceed current balance
        if validated_data.get("type") == "depense":
            current_balance = Transaction.get_current_balance()
            expense_amount = float(validated_data.get("amount", 0))
            
            if expense_amount > current_balance:
                raise ValidationError({
                    "amount": f"Le montant de la dépense ({expense_amount:,.0f} FCFA) dépasse le solde actuel ({current_balance:,.0f} FCFA). Solde insuffisant."
                })
        
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
        
        # Validate that a dépense doesn't exceed current balance
        # Check if type is being changed to dépense or amount is being increased
        new_type = validated_data.get("type", instance.type)
        new_amount = validated_data.get("amount", instance.amount)
        
        if new_type == "depense":
            # Calculate current balance excluding the current transaction being updated
            from django.db.models import Sum
            from decimal import Decimal
            
            # Get all transactions except the one being updated
            all_transactions = Transaction.objects.exclude(id=instance.id)
            total_recettes = all_transactions.filter(type="recette").aggregate(
                total=Sum("amount")
            )["total"] or Decimal('0')
            
            total_depenses = abs(all_transactions.filter(type="depense").aggregate(
                total=Sum("amount")
            )["total"] or Decimal('0'))
            
            # Calculate balance without the current transaction
            balance_without_current = float(total_recettes - total_depenses)
            
            # Add the new expense amount
            new_expense_amount = float(new_amount)
            
            if new_expense_amount > balance_without_current:
                raise ValidationError({
                    "amount": f"Le montant de la dépense ({new_expense_amount:,.0f} FCFA) dépasse le solde disponible ({balance_without_current:,.0f} FCFA). Solde insuffisant."
                })
        
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


class TransactionHistorySerializer(serializers.ModelSerializer):
    """Serializer for TransactionHistory model"""
    performed_by = serializers.SerializerMethodField()
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    class Meta:
        model = TransactionHistory
        fields = [
            "id",
            "transaction_id",
            "action",
            "action_display",
            "transaction_data",
            "performed_by",
            "created_at",
            "changes",
        ]
        read_only_fields = ["id", "created_at"]
    
    def get_performed_by(self, obj):
        """Return user info or None if null"""
        if obj.performed_by is None:
            return None
        return UserSerializer(obj.performed_by).data

