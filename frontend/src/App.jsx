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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-rose-50 flex flex-col font-sans text-gray-900 transition-colors duration-500">
      <Toaster position="top-right" />
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 flex-grow my-10 relative z-10 w-full max-w-7xl">
        <Routes>
          <Route path="/" element={
            <div className="text-center flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-700">
              <span className="inline-block px-4 py-1.5 rounded-full bg-red-100 text-red-700 font-bold text-sm tracking-widest mb-6 uppercase shadow-sm">Saving Lives Together</span>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight drop-shadow-sm">
                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-400">BloodCare</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 max-w-2xl font-medium leading-relaxed">
                The centralized, modern blood bank management system that connects donors, hospitals, and staff.
              </p>
              <div className="mt-10 flex gap-4">
                <Link to="/register" className="btn-primary text-lg px-8 py-6 rounded-full shadow-xl shadow-red-500/20">Get Started Now</Link>
                <Link to="/donors" className="btn-secondary text-lg px-8 py-6 rounded-full">Find Donors</Link>
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
