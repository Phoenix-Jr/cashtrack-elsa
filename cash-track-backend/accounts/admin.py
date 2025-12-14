from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["email", "name", "role", "status", "is_active", "created_at"]
    list_filter = ["role", "status", "is_active", "created_at"]
    search_fields = ["email", "name", "username"]
    ordering = ["-created_at"]
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Informations supplémentaires", {
            "fields": ("name", "role", "status")
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ("Informations supplémentaires", {
            "fields": ("email", "name", "role", "status")
        }),
    )
