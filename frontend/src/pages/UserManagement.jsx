import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { apiGet, apiPut } from '../services/apiClient';

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await apiGet('/api/admin/users', { withAuth: true });
            setUsers(data);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (userId, currentStatus) => {
        const confirmToggle = window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`);
        if (!confirmToggle) return;

        try {
            const data = await apiPut(`/api/admin/users/${userId}/status`, { is_active: !currentStatus }, { withAuth: true });

            toast.success(`User ${data.is_active ? 'activated' : 'deactivated'} successfully`);

            // update local list
            setUsers(users.map(u => u.id === userId ? { ...u, is_active: data.is_active } : u));
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading) return <LoadingSpinner message="Loading Users..." size="lg" />;

    return (
        <div className="page-wrap">
            <div className="content-card">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <span className="flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl shadow-inner">
                            👥
                        </span>
                        User Management
                    </h2>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white/70 shadow-sm">
                    <table className="min-w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100/50 border-b border-slate-100 text-xs uppercase tracking-widest text-slate-500">
                                <th className="px-6 py-5 font-black">Name</th>
                                <th className="px-6 py-5 font-black">Email</th>
                                <th className="px-6 py-5 font-black">Role</th>
                                <th className="px-6 py-5 font-black">Status</th>
                                <th className="px-6 py-5 font-black">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="font-bold text-slate-800 text-lg">{user.name}</div>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap font-medium text-slate-500">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-sm">
                                        <span className="px-3 py-1.5 inline-flex text-xs font-black tracking-wider uppercase rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        {user.is_active ? (
                                            <span className="px-3 py-1.5 inline-flex text-xs font-black tracking-wider uppercase rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">Active</span>
                                        ) : (
                                            <span className="px-3 py-1.5 inline-flex text-xs font-black tracking-wider uppercase rounded-lg bg-red-100 text-red-800 border border-red-200">Inactive</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                                        {user.role !== 'Admin' && (
                                            <button
                                                onClick={() => toggleStatus(user.id, user.is_active)}
                                                className={`px-4 py-2 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-sm ${user.is_active ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-100'}`}
                                            >
                                                {user.is_active ? 'Deactivate' : 'Activate'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && (
                        <div className="text-center py-16 text-slate-400 font-bold uppercase tracking-widest">No users found.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserManagement;
