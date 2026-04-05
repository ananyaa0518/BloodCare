import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import NotificationBell from './NotificationBell';

function Navbar() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed parsing user", e);
                setUser(null);
            }
        } else {
            setUser(null);
        }
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login', { replace: true });
    };

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap gap-3 justify-between items-center">
                <Link to="/" className="text-2xl font-black tracking-tighter text-primary flex items-center gap-2">
                    <span className="bg-red-600 text-white rounded-full p-1.5 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" style={{ width: '24px', height: '24px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </span>
                    BloodCare
                </Link>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm font-medium">
                    {/* Common Links */}
                    <Link to="/inventory" className="text-gray-600 hover:text-primary transition-colors">Inventory</Link>
                    <Link to="/requests" className="text-gray-600 hover:text-primary transition-colors">Emergency Requests</Link>

                    {/* Role-based Links */}
                    {user?.role === 'Admin' && (
                        <Link to="/admin" className="text-purple-600/80 hover:text-purple-700 transition-colors">Admin Dashboard</Link>
                    )}

                    {user?.role === 'Donor' && (
                        <Link to="/dashboard" className="text-amber-600 hover:text-amber-700 transition-colors">My Dashboard</Link>
                    )}

                    {(!user || user?.role === 'Hospital Staff' || user?.role === 'Blood Bank Staff') && (
                        <Link to="/donors" className="text-gray-600 hover:text-primary transition">Donors Directory</Link>
                    )}

                    <div className="flex items-center gap-3 ml-2 sm:ml-4 border-l border-gray-200 pl-3 sm:pl-4">
                        <span className="text-sm text-gray-500">Hello, <span className="font-semibold text-gray-900">{user?.name || 'User'}</span></span>

                        {user?.role === 'Donor' && <NotificationBell user={user} />}

                        <button
                            onClick={handleLogout}
                            className="btn-secondary"
                        >
                            Log out
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
