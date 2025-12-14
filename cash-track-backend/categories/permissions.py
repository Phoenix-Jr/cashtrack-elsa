from rest_framework import permissions


class IsAdminRole(permissions.BasePermission):
    """
    Permission personnalisée pour vérifier que l'utilisateur a le rôle 'admin'
    """
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'role') and
            request.user.role == 'admin'
        )

