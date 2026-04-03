import { useState, useEffect } from 'react';
import { API_URL } from '../config';

const DonorsList = () => {
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [filters, setFilters] = useState({
        blood_type: '',
        city: ''
    });

    const fetchDonors = async () => {
        setLoading(true);
        try {
            // Build query string
            const params = new URLSearchParams();
            if (filters.blood_type) params.append('blood_type', filters.blood_type);
            if (filters.city) params.append('city', filters.city);

            const response = await fetch(`${API_URL}/api/donors?${params.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to fetch donors');
            }

            const data = await response.json();
            setDonors(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDonors();
    }, [filters]); // Refetch when filters change

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="max-w-7xl mx-auto py-8 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <span className="flex items-center justify-center w-12 h-12 bg-red-100 text-red-600 rounded-2xl shadow-inner">
                            🩸
                        </span>
                        Blood Donors Directory
                    </h2>
                    <p className="mt-2 text-slate-500 font-medium">Search and find available blood donors in your area.</p>
                </div>
            </div>

            {/* Search Filters */}
            <div className="glass p-6 rounded-3xl border border-white shadow-xl shadow-slate-200/40 mb-8 flex flex-col md:flex-row gap-5 items-end">
                <div className="w-full md:w-1/3">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Blood Type</label>
                    <select
                        name="blood_type"
                        value={filters.blood_type}
                        onChange={handleFilterChange}
                        className="input-field bg-white shadow-sm"
                    >
                        <option value="">All Types</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                    </select>
                </div>

                <div className="w-full md:w-1/3">
                    <label className="block text-sm font-bold text-slate-700 mb-2">City</label>
                    <input
                        type="text"
                        name="city"
                        placeholder="Search by city..."
                        value={filters.city}
                        onChange={handleFilterChange}
                        className="input-field bg-white shadow-sm"
                    />
                </div>
            </div>

            {/* Donors List */}
            {error && <div className="bg-red-50/90 text-red-700 p-4 rounded-xl border border-red-200 mb-6 font-semibold shadow-sm">{error}</div>}

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-14 w-14 border-4 border-slate-200 border-t-red-600 mx-auto shadow-sm"></div>
                    <p className="mt-4 text-slate-500 font-bold tracking-wide">Loading donor database...</p>
                </div>
            ) : donors.length === 0 ? (
                <div className="text-center py-16 bg-slate-50/50 rounded-3xl border border-dashed border-slate-300">
                    <span className="text-5xl mb-4 block opacity-50">🔍</span>
                    <p className="text-xl font-bold text-slate-600">No donors found matching your criteria.</p>
                    <p className="text-slate-400 mt-2">Try adjusting your filters to find more results.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {donors.map(donor => (
                        <div key={donor.id} className="glass p-8 rounded-3xl border border-white hover:border-red-200 shadow-lg shadow-slate-200/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{donor.name}</h3>
                                <span className="bg-gradient-to-br from-red-500 to-rose-600 shadow-md shadow-red-500/20 text-white text-lg font-black px-4 py-1.5 rounded-xl tracking-widest">
                                    {donor.blood_type}
                                </span>
                            </div>
                            <div className="space-y-3 mb-8">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold uppercase tracking-wider text-slate-400">Age:</span>
                                    <span className="font-semibold text-slate-700">{donor.age} years</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold uppercase tracking-wider text-slate-400">City:</span>
                                    <span className="font-semibold text-slate-700">{donor.city || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold uppercase tracking-wider text-slate-400">Phone:</span>
                                    <span className="font-semibold text-slate-700">{donor.phone || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold uppercase tracking-wider text-slate-400">Last Donated:</span>
                                    <span className="font-semibold text-slate-700">{donor.last_donation_date ? new Date(donor.last_donation_date).toLocaleDateString() : 'Never'}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => alert(`Contacting ${donor.name} at ${donor.phone}...`)}
                                className="w-full bg-red-50 text-red-600 font-bold py-3.5 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100"
                            >
                                Contact Donor
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DonorsList;
