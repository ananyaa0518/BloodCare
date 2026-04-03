import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DonorDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // New Donation Form State
    const [showDonationForm, setShowDonationForm] = useState(false);
    const [donationData, setDonationData] = useState({
        donation_date: '',
        location: '',
        units: 1,
        notes: ''
    });

    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!token || !user) {
            navigate('/login');
            return;
        }
        fetchDashboardData();
    }, [navigate]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch Profile
            const profileRes = await fetch(`${import.meta.env.VITE_API_URL}/api/donors/${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!profileRes.ok) throw new Error('Failed to fetch profile');
            const profileData = await profileRes.json();
            setProfile(profileData);

            // Fetch History
            const historyRes = await fetch(`${import.meta.env.VITE_API_URL}/api/donors/${user.id}/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!historyRes.ok) throw new Error('Failed to fetch donation history');
            const historyData = await historyRes.json();
            setHistory(historyData);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDonationSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/donors/${user.id}/history`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(donationData)
            });

            if (!res.ok) throw new Error('Failed to log donation');

            const newRecord = await res.json();
            setHistory([newRecord, ...history]);
            setShowDonationForm(false);
            setDonationData({ donation_date: '', location: '', units: 1, notes: '' });

        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div className="text-center py-10">Loading Dashboard...</div>;
    if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 py-8 px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-sm">
                <h1 className="text-3xl font-black tracking-tight text-slate-800">
                    Welcome back, <span className="text-red-600 drop-shadow-sm">{profile?.name}</span>
                </h1>
                <button
                    onClick={() => {
                        localStorage.clear();
                        navigate('/login');
                        window.location.reload();
                    }}
                    className="bg-slate-100/80 hover:bg-red-50 text-slate-700 hover:text-red-600 px-5 py-2.5 rounded-xl font-bold transition-all border border-slate-200 hover:border-red-200 shadow-sm"
                >
                    Logout
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1 glass p-8 rounded-3xl border border-white shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-400 opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
                    <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-800">
                        <span className="flex items-center justify-center w-10 h-10 bg-red-100 text-red-600 rounded-xl shadow-inner">
                            🩸
                        </span>
                        My Profile
                    </h2>
                    <div className="space-y-4 text-slate-700">
                        <div className="flex flex-col border-b border-slate-100 pb-3">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">Role</span>
                            <span className="font-bold text-lg">{profile?.role}</span>
                        </div>
                        <div className="flex flex-col border-b border-slate-100 pb-3">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">Blood Type</span>
                            <div>
                                <span className="bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md shadow-red-500/20 px-3 py-1 rounded-lg font-black tracking-widest">{profile?.blood_type}</span>
                            </div>
                        </div>
                        <div className="flex flex-col border-b border-slate-100 pb-3">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">Email</span>
                            <span className="font-semibold">{profile?.email}</span>
                        </div>
                        <div className="flex flex-col border-b border-slate-100 pb-3">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">Phone</span>
                            <span className="font-semibold">{profile?.phone || 'Not provided'}</span>
                        </div>
                        <div className="flex flex-col border-b border-slate-100 pb-3">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">City</span>
                            <span className="font-semibold">{profile?.city || 'Not provided'}</span>
                        </div>
                        <div className="flex flex-col pb-1">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">Age</span>
                            <span className="font-semibold">{profile?.age} years old</span>
                        </div>
                    </div>
                </div>

                {/* Donation History Main Area */}
                <div className="lg:col-span-2">
                    <div className="glass p-8 rounded-3xl border border-white shadow-xl shadow-slate-200/40 min-h-full">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Donation History</h2>
                            <button
                                onClick={() => setShowDonationForm(!showDonationForm)}
                                className={`font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm ${showDonationForm ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'btn-primary'}`}
                            >
                                {showDonationForm ? 'Cancel Form' : '+ Log Donation'}
                            </button>
                        </div>

                        {/* Donation Form */}
                        {showDonationForm && (
                            <form onSubmit={handleDonationSubmit} className="bg-gradient-to-br from-red-50 to-rose-50/30 p-6 rounded-2xl mb-8 border border-red-100 shadow-inner animate-in fade-in slide-in-from-top-4 duration-300">
                                <h3 className="text-sm font-black uppercase tracking-wider text-red-800 mb-5">Record New Donation</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Date</label>
                                        <input type="date" required value={donationData.donation_date} onChange={e => setDonationData({ ...donationData, donation_date: e.target.value })} className="input-field bg-white shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Units</label>
                                        <input type="number" min="1" required value={donationData.units} onChange={e => setDonationData({ ...donationData, units: e.target.value })} className="input-field bg-white shadow-sm" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Location</label>
                                        <input type="text" placeholder="Hospital or Blood Bank" required value={donationData.location} onChange={e => setDonationData({ ...donationData, location: e.target.value })} className="input-field bg-white shadow-sm" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Notes <span className="font-normal opacity-70">(Optional)</span></label>
                                        <textarea value={donationData.notes} onChange={e => setDonationData({ ...donationData, notes: e.target.value })} className="input-field bg-white shadow-sm resize-none" rows="3"></textarea>
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-slate-900 border border-slate-800 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-all shadow-md active:scale-[0.98]">
                                    Save Donation Record
                                </button>
                            </form>
                        )}

                        {/* History Table */}
                        {history.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                <span className="text-4xl mb-3 block opacity-50">📋</span>
                                <p className="text-slate-500 font-bold">No donation history found yet.</p>
                                <p className="text-sm text-slate-400 mt-1">Log your first donation above to start tracking!</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-sm">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-widest text-slate-500">
                                            <th className="p-4 font-black">Date</th>
                                            <th className="p-4 font-black">Location</th>
                                            <th className="p-4 font-black">Units</th>
                                            <th className="p-4 font-black">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {history.map((record) => (
                                            <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="p-4 font-bold text-slate-700">{new Date(record.donation_date).toLocaleDateString()}</td>
                                                <td className="p-4 font-semibold text-slate-600">{record.location}</td>
                                                <td className="p-4 text-slate-600 font-medium">
                                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-700 font-black">
                                                        {record.units}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs px-3 py-1.5 rounded-lg font-black tracking-wider uppercase">
                                                        {record.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonorDashboard;
