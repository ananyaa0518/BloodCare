import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import DonorRegistration from './pages/DonorRegistration';
import DonorsList from './pages/DonorsList';
import DonorDashboard from './pages/DonorDashboard';
import InventoryDashboard from './pages/InventoryDashboard';
import EmergencyRequestForm from './pages/EmergencyRequestForm';
import RequestsList from './pages/RequestsList';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import {
  clearAuthSession,
  getDefaultRouteForRole,
  getStoredAuthSession,
  isTokenValid,
} from './utils/auth';

function AuthOnlyRoute({ children }) {
  const { token, user } = getStoredAuthSession();
  const isAuthenticated = Boolean(user && isTokenValid(token));

  if (isAuthenticated) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return children;
}

function RoleDashboardRedirect() {
  const { token, user } = getStoredAuthSession();
  const isAuthenticated = Boolean(user && isTokenValid(token));

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
}

function App() {
  const location = useLocation();
  const { token, user } = getStoredAuthSession();
  const hasValidToken = isTokenValid(token);
  const isAuthenticated = Boolean(user && hasValidToken);
  const hideNavbarOnPaths = ['/login', '/register'];
  const shouldShowNavbar = isAuthenticated && !hideNavbarOnPaths.includes(location.pathname);

  useEffect(() => {
    if ((token || user) && !isAuthenticated) {
      console.log('[auth] invalid session detected in App, clearing storage');
      clearAuthSession();
    }
  }, [token, user, isAuthenticated]);

  useEffect(() => {
    console.log('[auth] app route check', {
      pathname: location.pathname,
      isAuthenticated,
      role: user?.role,
    });
  }, [location.pathname, isAuthenticated, user]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Toaster position="top-right" />
      {shouldShowNavbar && <Navbar />}

      <main className="grow">
        <Routes>
          <Route path="/" element={<Navigate to={isAuthenticated ? getDefaultRouteForRole(user?.role) : '/login'} replace />} />
          <Route path="/login" element={<AuthOnlyRoute><Login /></AuthOnlyRoute>} />
          <Route path="/register" element={<AuthOnlyRoute><Register /></AuthOnlyRoute>} />
          <Route path="/donor-registration" element={<DonorRegistration />} />
          <Route path="/dashboard" element={<RoleDashboardRedirect />} />

          <Route path="/donor-dashboard" element={<ProtectedRoute allowedRoles={['Donor']}><DonorDashboard /></ProtectedRoute>} />
          <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />

          <Route path="/donors" element={<ProtectedRoute><DonorsList /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><InventoryDashboard /></ProtectedRoute>} />
          <Route path="/requests" element={<ProtectedRoute><RequestsList /></ProtectedRoute>} />
          <Route path="/emergency-request" element={<ProtectedRoute><EmergencyRequestForm /></ProtectedRoute>} />
          <Route path="/admin" element={<Navigate to="/admin-dashboard" replace />} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['Admin']}><UserManagement /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to={isAuthenticated ? getDefaultRouteForRole(user?.role) : '/login'} replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
