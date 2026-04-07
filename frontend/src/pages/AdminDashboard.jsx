import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { apiGet } from '../services/apiClient';

function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await apiGet('/api/admin/stats', { withAuth: true });
                setStats(data);
            } catch (err) {
                toast.error(err.message);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [navigate]);

    if (loading) return <LoadingSpinner message="Loading Admin Dashboard..." size="lg" />;

    if (!stats) return null;

    return (
        <div className="page-wrap space-y-6">
            <div className="content-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <span className="flex items-center justify-center w-10 h-10 bg-slate-100 text-slate-600 rounded-xl shadow-inner">
                            ⚙️
                        </span>
                        Admin Dashboard
                    </h1>
                </div>
                <Link to="/admin/users" className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-[0.98]">
                    Manage Users
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass p-8 rounded-3xl border border-white shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400 opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
                    <h3 className="text-slate-400 font-black tracking-widest text-xs uppercase mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Total Donors
                    </h3>
                    <p className="text-5xl font-black text-slate-800 tracking-tighter">{stats.totalDonors}</p>
                </div>

                <div className="glass p-8 rounded-3xl border border-white shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400 opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
                    <h3 className="text-slate-400 font-black tracking-widest text-xs uppercase mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Inventory Units
                    </h3>
                    <p className="text-5xl font-black text-slate-800 tracking-tighter">{stats.totalInventoryUnits}</p>
                </div>

                <div className="glass p-8 rounded-3xl border border-white shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-400 opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
                    <h3 className="text-slate-400 font-black tracking-widest text-xs uppercase mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span> Active Emergencies
                    </h3>
                    <p className="text-5xl font-black tracking-tighter text-red-600">{stats.activeRequests}</p>
                </div>
            </div>

            <div className="content-card p-0 overflow-hidden">
                <div className="p-8 border-b border-white/50 bg-white/40">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Recent Activity</h2>
                </div>
                <div className="p-0">
                    {stats.recentUsers && stats.recentUsers.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {stats.recentUsers.map(user => (
                                <div key={user.id} className="p-6 flex justify-between items-center hover:bg-white/60 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-black text-lg border border-slate-200">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-lg">{user.name}</p>
                                            <p className="text-sm text-slate-500 font-medium">Registered as <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">{user.role}</span></p>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-16 text-center text-slate-500 font-bold bg-white/30">No recent activity found.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
