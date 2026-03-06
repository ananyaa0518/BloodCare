import { useState, useEffect } from 'react';

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

            const response = await fetch(`http://localhost:5000/api/donors?${params.toString()}`);

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
        <div className="container mx-auto p-4">
            <h2 className="text-3xl font-bold mb-6 text-red-600">Blood Donors</h2>

            {/* Search Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="w-full md:w-1/3">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Blood Type</label>
                    <select
                        name="blood_type"
                        value={filters.blood_type}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
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
                    <label className="block text-gray-700 text-sm font-bold mb-2">City</label>
                    <input
                        type="text"
                        name="city"
                        placeholder="Search by city..."
                        value={filters.city}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>
            </div>

            {/* Donors List */}
            {error && <div className="text-red-500 bg-red-50 p-3 rounded mb-4">{error}</div>}

            {loading ? (
                <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading donors...</p>
                </div>
            ) : donors.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <p className="text-xl text-gray-500">No donors found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {donors.map(donor => (
                        <div key={donor.id} className="bg-white p-6 rounded-lg shadow-md border-t-4 border-red-500 hover:shadow-lg transition">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-gray-800">{donor.name}</h3>
                                <span className="bg-red-100 text-red-800 text-lg font-bold px-3 py-1 rounded-full">
                                    {donor.blood_type}
                                </span>
                            </div>
                            <div className="space-y-2 text-gray-600">
                                <p><span className="font-semibold">Age:</span> {donor.age}</p>
                                <p><span className="font-semibold">City:</span> {donor.city}</p>
                                <p><span className="font-semibold">Phone:</span> {donor.phone}</p>
                                {donor.last_donation_date && (
                                    <p><span className="font-semibold">Last Donated:</span> {new Date(donor.last_donation_date).toLocaleDateString()}</p>
                                )}
                            </div>
                            <button
                                onClick={() => alert(`Contacting ${donor.name} at ${donor.phone}...`)}
                                className="mt-6 w-full bg-red-50 text-red-600 font-semibold py-2 rounded hover:bg-red-100 transition"
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
