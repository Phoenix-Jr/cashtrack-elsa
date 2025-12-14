from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    is_superuser = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = User
        fields = ["id", "email", "name", "role", "status", "created_at", "is_superuser"]
        read_only_fields = ["id", "created_at", "is_superuser"]


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating users"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    
    class Meta:
        model = User
        fields = ["email", "password", "name", "role", "status"]
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["email"],
            email=validated_data["email"],
            password=validated_data["password"],
            name=validated_data.get("name", ""),
            role=validated_data.get("role", "user"),
            status=validated_data.get("status", "active"),
        )
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating users"""
    
    class Meta:
        model = User
        fields = ["name", "role", "status"]


class LoginSerializer(serializers.Serializer):
    """Serializer for login"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

