import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoadingState } from '../../components/common/LoadingState';
import { useAuthStore } from './authStore';

export function ProtectedRoute() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isRestoring = useAuthStore((state) => state.isRestoring);

  if (isRestoring) {
    return <LoadingState message="Restoring your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
