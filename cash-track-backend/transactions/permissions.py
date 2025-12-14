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


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission personnalisée pour permettre aux utilisateurs de modifier leurs propres transactions
    ou aux admins de modifier toutes les transactions
    Les utilisateurs en lecture seule ne peuvent pas modifier
    """
    
    def has_object_permission(self, request, view, obj):
        # Les utilisateurs en lecture seule ne peuvent pas modifier
        if hasattr(request.user, 'role') and request.user.role == 'readonly':
            return False
        
        # Les admins peuvent tout faire
        if hasattr(request.user, 'role') and request.user.role == 'admin':
            return True
        
        # Les utilisateurs peuvent modifier leurs propres transactions
        if hasattr(obj, 'created_by') and obj.created_by == request.user:
            return True
        
        return False
