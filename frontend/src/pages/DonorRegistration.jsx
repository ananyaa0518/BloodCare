import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DonorRegistration = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        blood_type: '',
        age: '',
        phone: '',
        city: '',
        last_donation_date: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateEligibility = () => {
        const age = parseInt(formData.age);
        if (age < 18 || age > 65) {
            return 'Donors must be between 18 and 65 years old.';
        }

        if (formData.last_donation_date) {
            const today = new Date();
            const lastDonation = new Date(formData.last_donation_date);

            const diffTime = Math.abs(today - lastDonation);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 90) {
                return 'You must wait at least 3 months between donations.';
            }
        }

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const validationError = validateEligibility();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...formData, role: 'Donor' }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Registration successful!');
                navigate('/donors');
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6 text-center text-red-600">Register as Donor</h2>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
                    <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>

                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>

                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                    <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Blood Type</label>
                        <select name="blood_type" required value={formData.blood_type} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500">
                            <option value="">Select</option>
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
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Age</label>
                        <input type="number" name="age" required value={formData.age} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Phone</label>
                        <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">City</label>
                        <input type="text" name="city" required value={formData.city} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                </div>

                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Last Donation Date (Optional)</label>
                    <input type="date" name="last_donation_date" value={formData.last_donation_date} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>

                <button type="submit" disabled={loading} className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700 transition disabled:bg-red-400">
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
        </div>
    );
};

export default DonorRegistration;
