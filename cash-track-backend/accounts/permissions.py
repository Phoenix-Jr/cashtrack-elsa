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


class IsReadOnlyRole(permissions.BasePermission):
    """
    Permission personnalisée pour vérifier que l'utilisateur a le rôle 'readonly'
    """
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'role') and
            request.user.role == 'readonly'
        )


class IsNotReadOnly(permissions.BasePermission):
    """
    Permission pour vérifier que l'utilisateur n'est PAS en lecture seule
    Permet les opérations de création/modification/suppression
    """
    
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        if hasattr(request.user, 'role'):
            # Les admins et utilisateurs normaux peuvent modifier
            return request.user.role in ['admin', 'user']
        
        return True
