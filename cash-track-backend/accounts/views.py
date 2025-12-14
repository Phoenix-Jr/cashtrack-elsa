from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User
from .serializers import (
    UserSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    LoginSerializer,
)
from .permissions import IsAdminRole


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    """Login endpoint"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]
        
        try:
            user = User.objects.get(email=email)
            if user.check_password(password) and user.is_active and user.status == "active":
                refresh = RefreshToken.for_user(user)
                user_serializer = UserSerializer(user)
                
                return Response({
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user": user_serializer.data,
                }, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"error": "Identifiants invalides ou compte inactif"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        except User.DoesNotExist:
            return Response(
                {"error": "Identifiants invalides"},
                status=status.HTTP_401_UNAUTHORIZED
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def refresh_token_view(request):
    """Refresh token endpoint"""
    refresh_token = request.data.get("refresh")
    
    if not refresh_token:
        return Response(
            {"error": "Token de rafraîchissement requis"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        refresh = RefreshToken(refresh_token)
        access_token = refresh.access_token
        
        return Response({
            "access": str(access_token),
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"error": "Token invalide"},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """Get current authenticated user"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Logout endpoint"""
    # In a simple JWT setup, we just return success
    # The client should remove the tokens
    return Response({"message": "Déconnexion réussie"}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAdminRole])
def change_user_password_view(request, pk):
    """Change user password (Admin only)"""
    try:
        user = User.objects.get(pk=pk)
        
        # Prevent changing superuser password
        if user.is_superuser:
            return Response(
                {"error": "Le mot de passe du compte superadmin ne peut pas être modifié"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        new_password = request.data.get("password")
        if not new_password:
            return Response(
                {"error": "Le mot de passe est requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate password
        from django.contrib.auth.password_validation import validate_password
        try:
            validate_password(new_password, user)
        except Exception as e:
            return Response(
                {"error": "Mot de passe invalide", "details": list(e.messages)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(new_password)
        user.save()
        
        return Response(
            {"message": "Mot de passe modifié avec succès"},
            status=status.HTTP_200_OK
        )
    except User.DoesNotExist:
        return Response(
            {"error": "Utilisateur non trouvé"},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(["POST"])
@permission_classes([IsAdminRole])
def toggle_user_status_view(request, pk):
    """Toggle user active/inactive status (Admin only)"""
    try:
        user = User.objects.get(pk=pk)
        
        # Prevent modifying superuser status
        if user.is_superuser:
            return Response(
                {"error": "Le statut du compte superadmin ne peut pas être modifié"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Prevent user from deactivating themselves
        if user.id == request.user.id:
            return Response(
                {"error": "Vous ne pouvez pas vous désactiver vous-même"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Toggle status
        new_status = "active" if user.status == "inactive" else "inactive"
        user.status = new_status
        user.is_active = (new_status == "active")
        user.save()
        
        return Response(
            {
                "message": f"Statut de l'utilisateur modifié à {new_status}",
                "status": new_status
            },
            status=status.HTTP_200_OK
        )
    except User.DoesNotExist:
        return Response(
            {"error": "Utilisateur non trouvé"},
            status=status.HTTP_404_NOT_FOUND
        )


class UserListCreateView(generics.ListCreateAPIView):
    """List and create users (Admin only)"""
    queryset = User.objects.all()
    permission_classes = [IsAdminRole]
    
    def get_serializer_class(self):
        if self.request.method == "POST":
            return UserCreateSerializer
        return UserSerializer


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a user (Admin only)"""
    queryset = User.objects.all()
    serializer_class = UserUpdateSerializer
    permission_classes = [IsAdminRole]
    
    def get_queryset(self):
        """Filter out superusers from being modified"""
        return User.objects.filter(is_superuser=False)
    
    def get_serializer_class(self):
        if self.request.method == "GET":
            return UserSerializer
        return UserUpdateSerializer
    
    def update(self, request, *args, **kwargs):
        """Prevent updating superuser"""
        instance = self.get_object()
        if instance.is_superuser:
            return Response(
                {"error": "Le compte superadmin ne peut pas être modifié"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Prevent deleting superuser and prevent user from deleting themselves"""
        instance = self.get_object()
        if instance.is_superuser:
            return Response(
                {"error": "Le compte superadmin ne peut pas être supprimé"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Prevent user from deleting themselves
        if instance.id == request.user.id:
            return Response(
                {"error": "Vous ne pouvez pas supprimer votre propre compte"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)
