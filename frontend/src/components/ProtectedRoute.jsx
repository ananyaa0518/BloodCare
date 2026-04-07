import { Navigate, useLocation } from 'react-router-dom';
import {
  clearAuthSession,
  getDefaultRouteForRole,
  getStoredAuthSession,
  isTokenValid,
} from '../utils/auth';

function ProtectedRoute({ children, allowedRoles = null }) {
  const location = useLocation();
  const { token, user } = getStoredAuthSession();
  const hasValidToken = isTokenValid(token);
  const isAuthenticated = Boolean(user && hasValidToken);

  console.log('[auth] protected route check', {
    path: location.pathname,
    hasToken: Boolean(token),
    hasUser: Boolean(user),
    hasValidToken,
    role: user?.role,
  });

  if (!isAuthenticated) {
    clearAuthSession();
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return children;
}

export default ProtectedRoute;
