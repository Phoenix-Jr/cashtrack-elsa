from django.contrib import admin
from .models import Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ["id", "ref", "type", "description", "amount", "category", "created_by", "created_at"]
    list_filter = ["type", "category", "created_at"]
    search_fields = ["ref", "description", "exporter_fournisseur"]
    readonly_fields = ["created_at", "updated_at"]
    ordering = ["-created_at"]
    date_hierarchy = "created_at"
