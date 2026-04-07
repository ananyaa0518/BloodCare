import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Droplets, HeartPulse, ShieldCheck, UserPlus, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getDefaultRouteForRole, normalizeAuthResponse, saveAuthSession } from '../utils/auth';
import { apiPost } from '../services/apiClient';
import InlineAlert from '../components/common/InlineAlert';

const ROLES = [
    { label: 'Donor', value: 'Donor', description: 'Individual blood donor account' },
    { label: 'Hospital', value: 'Hospital Staff', description: 'Hospital and emergency request management' },
    { label: 'Admin', value: 'Admin', description: 'Platform administration and oversight' },
];
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
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { name, email, password, confirmPassword, role, blood_type, age, last_donation_date } = formData;

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));

        setFieldErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const nextErrors = {};

        if (!name || !email || !password || !confirmPassword || !role) {
            if (!name) nextErrors.name = 'Name is required';
            if (!email) nextErrors.email = 'Email is required';
            if (!password) nextErrors.password = 'Password is required';
            if (!confirmPassword) nextErrors.confirmPassword = 'Please confirm your password';
            if (!role) nextErrors.role = 'Please choose a role';
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailPattern.test(email)) {
            nextErrors.email = 'Enter a valid email address';
        }

        if (password !== confirmPassword) {
            nextErrors.confirmPassword = 'Passwords do not match';
        }

        if (role === 'Donor') {
            if (!blood_type || !age) {
                if (!blood_type) nextErrors.blood_type = 'Blood type is required for donors';
                if (!age) nextErrors.age = 'Age is required for donors';
            }
            if (age && Number(age) < 18) {
                nextErrors.age = 'Donors must be at least 18 years old';
            }
        }

        if (Object.keys(nextErrors).length > 0) {
            setFieldErrors(nextErrors);
            setError('Please review the highlighted fields.');
            return;
        }

        setError('');
        setFieldErrors({});
        setLoading(true);

        try {
            const data = await apiPost('/api/auth/register', {
                name,
                email,
                password,
                role,
                blood_type: role === 'Donor' ? blood_type : undefined,
                age: role === 'Donor' ? parseInt(age) : undefined,
                last_donation_date: role === 'Donor' ? last_donation_date : undefined
            });
            console.log('[auth] register API response', data);

            const { token, user } = normalizeAuthResponse(data);
            if (!token || !user) {
                throw new Error('Invalid registration response format');
            }

            saveAuthSession(token, user);
            const redirectPath = getDefaultRouteForRole(user.role);
            console.log('[auth] register success', { userId: user.id, role: user.role, redirectPath });

            toast.success("Account created successfully!");
            navigate(redirectPath, { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="auth-shell">
            <div className="auth-backdrop" aria-hidden="true" />

            <div className="auth-grid auth-grid-register">
                <aside className="auth-brand-panel">
                    <div className="auth-brand-badge">
                        <Droplets className="h-4 w-4" />
                        Join the Care Network
                    </div>

                    <h1 className="auth-brand-title">BloodCare</h1>
                    <p className="auth-brand-tagline">Saving Lives Through Smart Blood Management</p>
                    <p className="auth-brand-copy">
                        Create your account to collaborate with donors, hospitals, and blood banks in a streamlined platform designed for emergency-ready coordination.
                    </p>

                    <div className="auth-feature-list">
                        <div className="auth-feature-item">
                            <UserPlus className="h-5 w-5" />
                            Quick onboarding with role-specific registration
                        </div>
                        <div className="auth-feature-item">
                            <ShieldCheck className="h-5 w-5" />
                            Protected workflows for sensitive health operations
                        </div>
                        <div className="auth-feature-item">
                            <Building2 className="h-5 w-5" />
                            Unified collaboration for hospitals and blood teams
                        </div>
                    </div>
                </aside>

                <div className="auth-form-wrap">
                    <div className="auth-card">
                        <div className="text-center">
                            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Create Your Account</h2>
                            <p className="mt-3 text-sm text-slate-600 font-medium">Get started in a few simple steps</p>
                        </div>

                        <InlineAlert type="error" message={error} className="mt-6" />

                        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                            <div className="bg-slate-50/70 p-3 border border-slate-200 rounded-xl">
                                <label className="block text-sm font-bold text-slate-700 mb-2" htmlFor="role">I am registering as:</label>
                                <div className="relative">
                                    <select
                                        id="role"
                                        name="role"
                                        value={role}
                                        onChange={onChange}
                                        className={`input-field bg-white cursor-pointer font-medium ${fieldErrors.role ? 'border-red-400 focus-visible:ring-red-500' : ''}`}
                                    >
                                        {ROLES.map((r) => (
                                            <option key={r.value} value={r.value}>{r.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">{ROLES.find((r) => r.value === role)?.description}</p>
                                {fieldErrors.role && <p className="text-xs text-red-600 mt-1">{fieldErrors.role}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="name">Full Name</label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={name}
                                        onChange={onChange}
                                        className={`input-field ${fieldErrors.name ? 'border-red-400 focus-visible:ring-red-500' : ''}`}
                                        placeholder="John Doe"
                                    />
                                    {fieldErrors.name && <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="email">Email address</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={email}
                                        onChange={onChange}
                                        className={`input-field ${fieldErrors.email ? 'border-red-400 focus-visible:ring-red-500' : ''}`}
                                        placeholder="you@example.com"
                                    />
                                    {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="password">Password</label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={password}
                                        onChange={onChange}
                                        className={`input-field ${fieldErrors.password ? 'border-red-400 focus-visible:ring-red-500' : ''}`}
                                        placeholder="••••••••"
                                    />
                                    {fieldErrors.password && <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="confirmPassword">Confirm Password</label>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={onChange}
                                        className={`input-field ${fieldErrors.confirmPassword ? 'border-red-400 focus-visible:ring-red-500' : ''}`}
                                        placeholder="••••••••"
                                    />
                                    {fieldErrors.confirmPassword && <p className="text-xs text-red-600 mt-1">{fieldErrors.confirmPassword}</p>}
                                </div>
                            </div>

                            {role === 'Donor' && (
                                <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200 space-y-4 mt-2">
                                    <h3 className="text-sm font-bold text-rose-800 flex items-center tracking-wide uppercase">
                                        <HeartPulse className="w-5 h-5 mr-2 text-rose-600" />
                                        Donor Information
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-rose-900 mb-1.5" htmlFor="blood_type">Blood Type</label>
                                            <select
                                                id="blood_type"
                                                name="blood_type"
                                                value={blood_type}
                                                onChange={onChange}
                                                className={`input-field bg-white border-rose-200 ${fieldErrors.blood_type ? 'border-red-400 focus-visible:ring-red-500' : ''}`}
                                            >
                                                {BLOOD_TYPES.map((type) => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                            {fieldErrors.blood_type && <p className="text-xs text-red-600 mt-1">{fieldErrors.blood_type}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-rose-900 mb-1.5" htmlFor="age">Age</label>
                                            <input
                                                id="age"
                                                name="age"
                                                type="number"
                                                min="18"
                                                max="100"
                                                value={age}
                                                onChange={onChange}
                                                className={`input-field bg-white border-rose-200 ${fieldErrors.age ? 'border-red-400 focus-visible:ring-red-500' : ''}`}
                                                placeholder="e.g. 25"
                                            />
                                            {fieldErrors.age && <p className="text-xs text-red-600 mt-1">{fieldErrors.age}</p>}
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

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary h-12 text-base rounded-xl shadow-lg shadow-rose-500/30 font-bold tracking-wide mt-2 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="inline-flex items-center gap-2">
                                        <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                                        Creating Account...
                                    </span>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </form>

                        <div className="text-center mt-6">
                            <p className="text-sm text-slate-600">
                                Already have an account?{' '}
                                <Link to="/login" className="font-semibold text-rose-600 hover:text-rose-700 transition-colors">
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Register;
