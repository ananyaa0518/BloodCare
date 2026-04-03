import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

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
            const response = await fetch(`${API_URL}/api/auth/register`, {
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
        <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="glass p-8 sm:p-10 rounded-3xl border border-white shadow-2xl shadow-red-500/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-400 opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-400 opacity-5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10 text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 text-red-600 rounded-2xl mb-4 shadow-inner">
                        🩸
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">Become a Hero</h2>
                    <p className="text-slate-500 font-medium mt-2">Register as a donor and save lives today.</p>
                </div>

                {error && <div className="bg-red-50 text-red-600 border border-red-100 p-4 rounded-xl mb-6 font-bold text-sm text-center shadow-sm relative z-10">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="sm:col-span-2">
                            <label className="block text-slate-700 text-xs font-black uppercase tracking-widest mb-2">Full Name</label>
                            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="input-field bg-white/60 focus:bg-white" placeholder="John Doe" />
                        </div>

                        <div>
                            <label className="block text-slate-700 text-xs font-black uppercase tracking-widest mb-2">Email</label>
                            <input type="email" name="email" required value={formData.email} onChange={handleChange} className="input-field bg-white/60 focus:bg-white" placeholder="john@example.com" />
                        </div>

                        <div>
                            <label className="block text-slate-700 text-xs font-black uppercase tracking-widest mb-2">Password</label>
                            <input type="password" name="password" required value={formData.password} onChange={handleChange} className="input-field bg-white/60 focus:bg-white" placeholder="••••••••" />
                        </div>

                        <div>
                            <label className="block text-slate-700 text-xs font-black uppercase tracking-widest mb-2">Blood Type</label>
                            <div className="relative">
                                <select name="blood_type" required value={formData.blood_type} onChange={handleChange} className="input-field bg-white/60 focus:bg-white appearance-none pr-10">
                                    <option value="" disabled>Select</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/0000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-700 text-xs font-black uppercase tracking-widest mb-2">Age</label>
                            <input type="number" name="age" required min="18" max="65" value={formData.age} onChange={handleChange} className="input-field bg-white/60 focus:bg-white" placeholder="18-65" />
                        </div>

                        <div>
                            <label className="block text-slate-700 text-xs font-black uppercase tracking-widest mb-2">Phone Number</label>
                            <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="input-field bg-white/60 focus:bg-white" placeholder="(555) 000-0000" />
                        </div>

                        <div>
                            <label className="block text-slate-700 text-xs font-black uppercase tracking-widest mb-2">City</label>
                            <input type="text" name="city" required value={formData.city} onChange={handleChange} className="input-field bg-white/60 focus:bg-white" placeholder="Your City" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-700 text-xs font-black uppercase tracking-widest mb-2">Last Donation Date <span className="font-medium text-slate-400 lowercase">(Optional)</span></label>
                        <input type="date" name="last_donation_date" value={formData.last_donation_date} onChange={handleChange} className="input-field bg-white/60 focus:bg-white" />
                    </div>

                    <button type="submit" disabled={loading} className="w-full btn-primary py-4 text-lg font-black uppercase tracking-widest mt-8 flex justify-center items-center gap-2">
                        {loading ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Registering...
                            </>
                        ) : 'Complete Registration'}
                    </button>

                    <p className="text-center text-sm text-slate-500 font-medium mt-6">
                        Already have an account? <span onClick={() => navigate('/login')} className="text-red-600 font-bold hover:underline cursor-pointer">Sign in here</span>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default DonorRegistration;
