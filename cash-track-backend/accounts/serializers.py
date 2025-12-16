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
    
    def validate_email(self, value):
        """Check if email already exists"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Un utilisateur avec cet email existe déjà.")
        return value
    
    def create(self, validated_data):
        """Create a new user"""
        email = validated_data["email"]
        password = validated_data["password"]
        status = validated_data.get("status", "active")
        
        # Since USERNAME_FIELD = "email", we pass email as the first positional argument
        # But we also need to pass username since it's in REQUIRED_FIELDS
        user = User.objects.create_user(
            email=email,  # This is the USERNAME_FIELD
            username=email,  # Required field, use email as username
            password=password,
            name=validated_data.get("name") or None,  # Use None instead of empty string
            role=validated_data.get("role", "user"),
            status=status,
        )
        
        # Ensure is_active is set correctly based on status
        user.is_active = (status == "active")
        user.save()
        
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

