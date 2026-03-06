import { Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import DonorRegistration from './pages/DonorRegistration';
import DonorsList from './pages/DonorsList';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <nav className="bg-red-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold tracking-tight">BloodCare</Link>
          <div className="space-x-4">
            <Link to="/donors" className="hover:text-red-200 transition">Donors</Link>
            <Link to="/donor-registration" className="hover:text-red-200 transition">Register as Donor</Link>
            <Link to="/login" className="hover:text-red-200 transition">Login</Link>
            <Link to="/register" className="hover:text-red-200 transition">Register</Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-4 mt-8">
        <Routes>
          <Route path="/" element={
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-red-600 mb-4">Welcome to BloodCare</h1>
              <p className="text-lg text-gray-600">The central blood bank management system.</p>
            </div>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/donor-registration" element={<DonorRegistration />} />
          <Route path="/donors" element={<DonorsList />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
