from django.db import models
from django.db.models import Sum, Q
from django.utils import timezone
from django.conf import settings
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
import json
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


class TransactionHistory(models.Model):
    """Model to track all transaction changes (create, update, delete)"""
    ACTION_CHOICES = [
        ("created", "Créé"),
        ("updated", "Modifié"),
        ("deleted", "Supprimé"),
    ]

    transaction_id = models.IntegerField(help_text="ID of the transaction (may not exist if deleted)")
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    
    # Store transaction data as JSON for deleted transactions
    transaction_data = models.JSONField(
        null=True, 
        blank=True,
        help_text="Full transaction data at the time of action (especially for deletions)"
    )
    
    # User who performed the action
    performed_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name="transaction_history_actions"
    )
    
    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Additional metadata
    changes = models.JSONField(
        null=True,
        blank=True,
        help_text="For updates: stores what fields were changed (old_value -> new_value)"
    )

    class Meta:
        db_table = "transaction_history"
        verbose_name = "Historique de transaction"
        verbose_name_plural = "Historique des transactions"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_action_display()} - Transaction #{self.transaction_id} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"

