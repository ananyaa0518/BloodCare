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
            const profileRes = await fetch(`http://localhost:5000/api/donors/${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!profileRes.ok) throw new Error('Failed to fetch profile');
            const profileData = await profileRes.json();
            setProfile(profileData);

            // Fetch History
            const historyRes = await fetch(`http://localhost:5000/api/donors/${user.id}/history`, {
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
            const res = await fetch(`http://localhost:5000/api/donors/${user.id}/history`, {
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
        <div className="container mx-auto p-4 max-w-5xl">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Welcome, {profile?.name}</h1>
                <button
                    onClick={() => {
                        localStorage.clear();
                        navigate('/login');
                    }}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                >
                    Logout
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Profile Card */}
                <div className="col-span-1 bg-white p-6 rounded-lg shadow border-t-4 border-red-600">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="text-red-600">🩸</span> My Profile
                    </h2>
                    <div className="space-y-3 text-gray-700">
                        <p><span className="font-semibold w-24 inline-block">Role:</span> {profile?.role}</p>
                        <p><span className="font-semibold w-24 inline-block">Blood Type:</span> <span className="bg-red-100 text-red-800 px-2 py-1 rounded font-bold">{profile?.blood_type}</span></p>
                        <p><span className="font-semibold w-24 inline-block">Email:</span> {profile?.email}</p>
                        <p><span className="font-semibold w-24 inline-block">Phone:</span> {profile?.phone}</p>
                        <p><span className="font-semibold w-24 inline-block">City:</span> {profile?.city}</p>
                        <p><span className="font-semibold w-24 inline-block">Age:</span> {profile?.age}</p>
                    </div>
                </div>

                {/* Donation History Main Area */}
                <div className="col-span-1 md:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Donation History</h2>
                            <button
                                onClick={() => setShowDonationForm(!showDonationForm)}
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                            >
                                {showDonationForm ? 'Cancel' : '+ Log Donation'}
                            </button>
                        </div>

                        {/* Donation Form Modal/Inline */}
                        {showDonationForm && (
                            <form onSubmit={handleDonationSubmit} className="bg-red-50 p-4 rounded mb-6 border border-red-200">
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-1 p-0">Date</label>
                                        <input type="date" required value={donationData.donation_date} onChange={e => setDonationData({ ...donationData, donation_date: e.target.value })} className="w-full border rounded p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1 p-0">Units</label>
                                        <input type="number" min="1" required value={donationData.units} onChange={e => setDonationData({ ...donationData, units: e.target.value })} className="w-full border rounded p-2" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold mb-1 p-0">Location</label>
                                        <input type="text" placeholder="Hospital or Blood Bank" required value={donationData.location} onChange={e => setDonationData({ ...donationData, location: e.target.value })} className="w-full border rounded p-2" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold mb-1 p-0">Notes (Optional)</label>
                                        <textarea value={donationData.notes} onChange={e => setDonationData({ ...donationData, notes: e.target.value })} className="w-full border rounded p-2"></textarea>
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 rounded hover:bg-green-700">Save Record</button>
                            </form>
                        )}

                        {/* History Table */}
                        {history.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No donation history found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100 border-b">
                                            <th className="p-3 font-semibold text-gray-600">Date</th>
                                            <th className="p-3 font-semibold text-gray-600">Location</th>
                                            <th className="p-3 font-semibold text-gray-600">Units</th>
                                            <th className="p-3 font-semibold text-gray-600">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map((record) => (
                                            <tr key={record.id} className="border-b hover:bg-gray-50">
                                                <td className="p-3">{new Date(record.donation_date).toLocaleDateString()}</td>
                                                <td className="p-3">{record.location}</td>
                                                <td className="p-3">{record.units}</td>
                                                <td className="p-3">
                                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
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
