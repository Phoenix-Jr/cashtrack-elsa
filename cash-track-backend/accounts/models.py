from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Extended User model with role and status"""
    
    ROLE_CHOICES = [
        ("admin", "Administrateur"),
        ("user", "Utilisateur"),
        ("readonly", "Lecture seule"),
    ]
    
    STATUS_CHOICES = [
        ("active", "Actif"),
        ("inactive", "Inactif"),
    ]
    
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="user")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]
    
    class Meta:
        db_table = "users"
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
    
    def __str__(self):
        return self.email
    
    @property
    def is_admin(self):
        return self.role == "admin"
    
    @property
    def is_readonly(self):
        return self.role == "readonly"
