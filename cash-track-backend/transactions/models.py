from django.db import models
from django.db.models import Sum, Q
from django.utils import timezone
from django.conf import settings
from accounts.models import User
from categories.models import Category


class Transaction(models.Model):
    """Transaction model"""
    TYPE_CHOICES = [
        ("recette", "Recette"),
        ("depense", "Dépense"),
    ]

    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    description = models.TextField(blank=True, null=True)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    ref = models.CharField(max_length=255, blank=True, null=True)
    exporter_fournisseur = models.CharField(max_length=255, blank=True, null=True)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="transactions"
    )
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="created_transactions"
    )
    modified_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="modified_transactions"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "transactions"
        verbose_name = "Transaction"
        verbose_name_plural = "Transactions"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.type} - {self.amount} FCFA - {self.created_at.strftime('%Y-%m-%d')}"
    
    @classmethod
    def get_current_balance(cls):
        """Calculate the current balance from all transactions"""
        total_recettes = cls.objects.filter(type="recette").aggregate(
            total=Sum("amount")
        )["total"] or 0
        
        total_depenses = abs(cls.objects.filter(type="depense").aggregate(
            total=Sum("amount")
        )["total"] or 0)
        
        return float(total_recettes - total_depenses)
    
    @classmethod
    def get_total_recettes(cls):
        """Get total recettes from all transactions"""
        total = cls.objects.filter(type="recette").aggregate(
            total=Sum("amount")
        )["total"] or 0
        return float(total)
    
    @classmethod
    def get_total_depenses(cls):
        """Get total depenses from all transactions"""
        total = abs(cls.objects.filter(type="depense").aggregate(
            total=Sum("amount")
        )["total"] or 0)
        return float(total)

