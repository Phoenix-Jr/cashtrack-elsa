import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Loader from '@/components/Loader';
import { useCurrentUser } from '@/hooks/useAuth';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute = ({ children, requireAuth = true }: ProtectedRouteProps) => {
  const { data: user, isLoading, error } = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && (!user || error)) {
      navigate("/auth/login", { replace: true });
    }
  }, [user, isLoading, error, navigate]);

  // Afficher un loader pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  // Rediriger vers login si non authentifié et authentification requise
  if (requireAuth && !user && !isLoading) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Rediriger vers dashboard si authentifié et tentative d'accès aux pages auth
  if (!requireAuth && user && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
