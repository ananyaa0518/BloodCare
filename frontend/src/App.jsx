import { Routes, Route, Navigate } from 'react-router-dom';
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

function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AuthOnlyRoute({ isAuthenticated, children }) {
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  const isAuthenticated = Boolean(localStorage.getItem('token'));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Toaster position="top-right" />
      {isAuthenticated && <Navbar />}

      <main className="grow">
        <Routes>
          <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
          <Route path="/login" element={<AuthOnlyRoute isAuthenticated={isAuthenticated}><Login /></AuthOnlyRoute>} />
          <Route path="/register" element={<AuthOnlyRoute isAuthenticated={isAuthenticated}><Register /></AuthOnlyRoute>} />
          <Route path="/donor-registration" element={<DonorRegistration />} />
          <Route path="/donors" element={<DonorsList />} />
          <Route path="/dashboard" element={<ProtectedRoute isAuthenticated={isAuthenticated}><DonorDashboard /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute isAuthenticated={isAuthenticated}><InventoryDashboard /></ProtectedRoute>} />
          <Route path="/requests" element={<ProtectedRoute isAuthenticated={isAuthenticated}><RequestsList /></ProtectedRoute>} />
          <Route path="/emergency-request" element={<EmergencyRequestForm />} />
          <Route path="/admin" element={<ProtectedRoute isAuthenticated={isAuthenticated}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute isAuthenticated={isAuthenticated}><UserManagement /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
