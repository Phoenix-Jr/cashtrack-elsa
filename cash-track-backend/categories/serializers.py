from rest_framework import serializers
from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model"""
    
    class Meta:
        model = Category
        fields = ["id", "name", "type", "color", "icon", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

