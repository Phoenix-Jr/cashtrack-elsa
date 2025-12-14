import { Navigate } from 'react-router-dom';
import Loader from '@/components/Loader';
import { useAppStore } from '@/stores/app-store';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  // Si déjà authentifié, rediriger vers le dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;

