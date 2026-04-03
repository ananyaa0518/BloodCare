import { Routes, Route, Link } from 'react-router-dom';
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

function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Toaster position="top-right" />
      <Navbar />

      <main className="flex-grow py-6 sm:py-8">
        <Routes>
          <Route path="/" element={
            <div className="page-wrap">
              <div className="content-card text-center space-y-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Welcome to BloodCare</h1>
                <p className="text-slate-600 max-w-2xl mx-auto">
                  A simple blood bank management platform for donors, hospitals, and administrators.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-2">
                  <Link to="/register" className="btn-primary">Create Account</Link>
                  <Link to="/donors" className="btn-secondary">Browse Donors</Link>
                </div>
              </div>
            </div>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/donor-registration" element={<DonorRegistration />} />
          <Route path="/donors" element={<DonorsList />} />
          <Route path="/dashboard" element={<DonorDashboard />} />
          <Route path="/inventory" element={<InventoryDashboard />} />
          <Route path="/requests" element={<RequestsList />} />
          <Route path="/emergency-request" element={<EmergencyRequestForm />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
