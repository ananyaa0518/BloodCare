import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = ['Admin', 'Blood Bank Staff', 'Hospital Staff', 'Donor'];
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Donor',
        blood_type: 'A+',
        age: '',
        last_donation_date: '',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { name, email, password, confirmPassword, role, blood_type, age, last_donation_date } = formData;

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!name || !email || !password || !confirmPassword || !role) {
            setError('Please fill in all required fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (role === 'Donor') {
            if (!blood_type || !age) {
                setError('Donors must provide their blood type and age');
                return;
            }
            if (age < 18) {
                setError('Donors must be at least 18 years old');
                return;
            }
        }

        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    role,
                    blood_type: role === 'Donor' ? blood_type : undefined,
                    age: role === 'Donor' ? parseInt(age) : undefined,
                    last_donation_date: role === 'Donor' ? last_donation_date : undefined
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Registration failed');

            // Success! Save user / token
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('token', data.token);

            toast.success("Account created successfully!");
            // Redirect based on role or to dashboard
            navigate('/');
            window.location.reload(); // Refresh to update navbar
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-100px)] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full relative z-10">
                {/* Decorative blobs */}
                <div className="absolute top-0 -left-6 w-80 h-80 bg-rose-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-10 left-32 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>

                <div className="relative glass p-10 sm:p-12 rounded-2xl shadow-2xl border border-white/40">
                    <div className="text-center">
                        <div className="mx-auto h-16 w-16 bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center rounded-2xl mb-6 shadow-inner transform rotate-3">
                            <UserPlus className="h-8 w-8 text-rose-600 transform -rotate-3" />
                        </div>
                        <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                            Create an Account
                        </h2>
                        <p className="mt-3 text-sm text-slate-600 font-medium">
                            Join BloodCare to save lives and manage requests
                        </p>
                    </div>

                    {error && (
                        <div className="mt-6 bg-red-50/80 text-red-600 px-4 py-3 rounded-lg border border-red-100 text-sm font-medium flex items-center gap-2">
                            {error}
                        </div>
                    )}

                    <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                        {/* Role Selection */}
                        <div className="bg-slate-50/50 p-2 border border-slate-100 rounded-xl shadow-inner">
                            <label className="block text-sm font-bold text-slate-700 ml-2 mb-2" htmlFor="role">
                                I am registering as a:
                            </label>
                            <div className="relative">
                                <select
                                    id="role"
                                    name="role"
                                    value={role}
                                    onChange={onChange}
                                    className="input-field bg-white cursor-pointer font-medium text-slate-900 border-none shadow-sm focus:ring-yellow-500"
                                >
                                    {ROLES.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="name">
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={name}
                                    onChange={onChange}
                                    className="input-field"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="email">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={onChange}
                                    className="input-field"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="password">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={password}
                                    onChange={onChange}
                                    className="input-field"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="confirmPassword">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={onChange}
                                    className="input-field"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Conditional Donor Fields */}
                        {role === 'Donor' && (
                            <div className="p-5 bg-rose-50/60 rounded-xl border border-rose-100/50 space-y-5 mt-4 transition-all duration-300">
                                <h3 className="text-sm font-bold text-rose-800 flex items-center tracking-wide uppercase">
                                    <HeartPulse className="w-5 h-5 mr-2 text-rose-600" />
                                    Donor Information
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-rose-900 mb-1.5" htmlFor="blood_type">
                                            Blood Type
                                        </label>
                                        <select
                                            id="blood_type"
                                            name="blood_type"
                                            value={blood_type}
                                            onChange={onChange}
                                            className="input-field bg-white border-rose-200"
                                        >
                                            {BLOOD_TYPES.map((type) => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-rose-900 mb-1.5" htmlFor="age">
                                            Age
                                        </label>
                                        <input
                                            id="age"
                                            name="age"
                                            type="number"
                                            min="18"
                                            max="100"
                                            value={age}
                                            onChange={onChange}
                                            className="input-field bg-white border-rose-200"
                                            placeholder="e.g. 25"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-rose-900 mb-1.5" htmlFor="last_donation_date">
                                        Last Donation Date <span className="font-normal opacity-70">(Optional)</span>
                                    </label>
                                    <input
                                        id="last_donation_date"
                                        name="last_donation_date"
                                        type="date"
                                        value={last_donation_date}
                                        onChange={onChange}
                                        className="input-field bg-white border-rose-200"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary h-12 text-base rounded-xl shadow-lg shadow-rose-500/30 font-bold tracking-wide uppercase mt-4"
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </div>
                    </form>

                    <div className="text-center mt-6">
                        <p className="text-sm text-slate-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-rose-500 hover:text-rose-600 transition-colors">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
