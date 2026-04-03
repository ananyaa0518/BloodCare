import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { API_URL } from '../config';

function RequestsList() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUserRole(parsedUser.role);
            } catch (e) {
                console.error("Could not parse user from localStorage");
            }
        }
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/requests`);
            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Failed to fetch requests');

            setRequests(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFulfillStatus = async (id, currentStatus) => {
        if (currentStatus === 'Fulfilled') return; // Do nothing if already fulfilled.

        const token = localStorage.getItem('token');
        if (!token) {
            alert('You must be logged in as Hospital Staff to do this.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/requests/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'Fulfilled' })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to update status');
            }

            // Successfully updated
            fetchRequests();
        } catch (err) {
            alert(err.message);
        }
    };

    // Color helpers based on Urgency and Status
    const topUrgencyColors = {
        'Critical': 'bg-red-100 border-red-500 text-red-900',
        'High': 'bg-orange-100 border-orange-500 text-orange-900',
        'Normal': 'bg-yellow-50 border-yellow-400 text-yellow-900'
    };

    const badgeUrgencyColors = {
        'Critical': 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-500/30',
        'High': 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30',
        'Normal': 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/30'
    };

    if (loading) return <LoadingSpinner message="Loading emergency requests..." size="lg" />;
    if (error) return <div className="text-center py-10 text-red-600 bg-red-50 rounded-lg">{error}</div>;

    return (
        <div className="page-wrap space-y-6">
            <div className="content-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-0 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-400 opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
                        <span className="flex items-center justify-center w-12 h-12 bg-red-100 text-red-600 rounded-2xl shadow-inner animate-pulse">
                            🚨
                        </span>
                        Emergency Requests
                    </h1>
                    <p className="mt-2 text-slate-500 font-medium text-lg">Active blood requirements from hospitals</p>
                </div>

                {(userRole === 'Hospital Staff' || userRole === 'Admin') && (
                    <Link to="/emergency-request" className="btn-primary relative z-10 px-6 py-3.5 rounded-xl font-black uppercase tracking-wider text-sm">
                        + Raise New Request
                    </Link>
                )}
            </div>

            {requests.length === 0 ? (
                <div className="glass p-16 rounded-3xl text-center border border-white shadow-sm">
                    <span className="text-5xl mb-4 block opacity-50">✨</span>
                    <p className="text-2xl font-bold text-slate-800">Clear Board</p>
                    <p className="text-slate-500 font-medium">No active emergency requests at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {requests.map(request => {
                        const isFulfilled = request.status === 'Fulfilled';
                        const cardStyles = isFulfilled
                            ? 'glass border-white/50 opacity-60 grayscale-[30%] shadow-none'
                            : 'glass border-white hover:border-red-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-slate-200/40';

                        return (
                            <div key={request.id} className={`rounded-3xl p-8 relative flex flex-col justify-between ${cardStyles}`}>
                                <div>
                                    <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                                        <div className="text-4xl font-black text-slate-800 drop-shadow-sm">{request.blood_type}</div>
                                        <div className={`text-xs px-4 py-1.5 rounded-xl font-black tracking-widest uppercase ${isFulfilled ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : badgeUrgencyColors[request.urgency_level]}`}>
                                            {isFulfilled ? 'Fulfilled' : request.urgency_level}
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-black text-slate-800 mb-2 leading-tight">{request.hospital_name}</h3>
                                    <p className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg text-sm font-bold text-slate-600 mb-6 border border-slate-200">
                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                        {request.units_required} unit{request.units_required > 1 ? 's' : ''} needed
                                    </p>

                                    <div className="space-y-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-bold text-slate-400 uppercase tracking-widest">Contact:</span>
                                            <span className="font-semibold text-slate-700">{request.contact}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-bold text-slate-400 uppercase tracking-widest">Posted:</span>
                                            <span className="font-semibold text-slate-700">{new Date(request.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {(!isFulfilled && (userRole === 'Hospital Staff' || userRole === 'Admin')) && (
                                    <button
                                        onClick={() => handleFulfillStatus(request.id, request.status)}
                                        className="mt-6 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest py-3.5 rounded-xl shadow-lg shadow-emerald-500/30 transition-all border border-emerald-400 active:scale-[0.98]"
                                    >
                                        Mark as Fulfilled
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
}

export default RequestsList;
