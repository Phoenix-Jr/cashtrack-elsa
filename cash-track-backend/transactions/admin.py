from django.contrib import admin
from .models import Transaction, TransactionHistory


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ["id", "ref", "type", "description", "amount", "category", "created_by", "created_at"]
    list_filter = ["type", "category", "created_at"]
    search_fields = ["ref", "description", "exporter_fournisseur"]
    readonly_fields = ["created_at", "updated_at"]
    ordering = ["-created_at"]
    date_hierarchy = "created_at"


@admin.register(TransactionHistory)
class TransactionHistoryAdmin(admin.ModelAdmin):
    list_display = ["id", "transaction_id", "action", "performed_by", "created_at"]
    list_filter = ["action", "created_at", "performed_by"]
    search_fields = ["transaction_id", "performed_by__name", "performed_by__email"]
    readonly_fields = ["id", "transaction_id", "action", "transaction_data", "performed_by", "created_at", "changes"]
    ordering = ["-created_at"]
    date_hierarchy = "created_at"
    
    def has_add_permission(self, request):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
