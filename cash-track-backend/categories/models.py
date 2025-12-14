from django.db import models


class Category(models.Model):
    """Category model for transactions"""
    
    TYPE_CHOICES = [
        ("recette", "Recette"),
        ("depense", "Dépense"),
        ("both", "Les deux"),
    ]
    
    name = models.CharField(max_length=255, unique=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="both")
    color = models.CharField(max_length=7, default="#0B74FF")  # Hex color
    icon = models.CharField(max_length=50, default="FolderOpen")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = "categories"
        verbose_name = "Catégorie"
        verbose_name_plural = "Catégories"
        ordering = ["name"]
    
    def __str__(self):
        return self.name
