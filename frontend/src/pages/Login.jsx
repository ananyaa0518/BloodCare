import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Droplets, HeartPulse, ShieldCheck } from 'lucide-react';
import { getDefaultRouteForRole, normalizeAuthResponse, saveAuthSession } from '../utils/auth';
import { apiPost } from '../services/apiClient';
import InlineAlert from '../components/common/InlineAlert';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { email, password } = formData;

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const data = await apiPost('/api/auth/login', formData);
            console.log('[auth] login API response', data);

            const { token, user } = normalizeAuthResponse(data);

            if (!token || !user) {
                throw new Error('Invalid login response format');
            }

            saveAuthSession(token, user);
            const redirectPath = getDefaultRouteForRole(user.role);
            console.log('[auth] login success', { userId: user.id, role: user.role, redirectPath });
            navigate(redirectPath, { replace: true });
        } catch (err) {
            setError(err.message || 'An error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="auth-shell">
            <div className="auth-backdrop" aria-hidden="true" />

            <div className="auth-grid">
                <aside className="auth-brand-panel">
                    <div className="auth-brand-badge">
                        <Droplets className="h-4 w-4" />
                        Blood Donation Platform
                    </div>

                    <h1 className="auth-brand-title">BloodCare</h1>
                    <p className="auth-brand-tagline">Saving Lives Through Smart Blood Management</p>
                    <p className="auth-brand-copy">
                        Coordinate donor data, monitor blood inventory, and respond to emergency requests in one secure system built for speed and reliability.
                    </p>

                    <div className="auth-feature-list">
                        <div className="auth-feature-item">
                            <ShieldCheck className="h-5 w-5" />
                            Secure role-based access for donors, hospitals, and admins
                        </div>
                        <div className="auth-feature-item">
                            <HeartPulse className="h-5 w-5" />
                            Live inventory tracking to reduce shortages
                        </div>
                        <div className="auth-feature-item">
                            <Activity className="h-5 w-5" />
                            Fast emergency request coordination across teams
                        </div>
                    </div>
                </aside>

                <div className="auth-form-wrap">
                    <div className="auth-card">
                        <div className="text-center">
                            <h2 className="text-3xl font-black tracking-tight text-slate-900">Welcome Back</h2>
                            <p className="mt-2 text-sm text-slate-600 font-medium">Sign in to continue to your dashboard</p>
                        </div>

                        <InlineAlert type="error" message={error} className="mt-6" />

                        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="email">Email address</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        value={email}
                                        onChange={onChange}
                                        className="input-field"
                                        placeholder="you@bloodcare.org"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="password">Password</label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={onChange}
                                        className="input-field"
                                        placeholder="Enter your password"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary h-12 text-base rounded-xl shadow-lg shadow-red-500/30 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="inline-flex items-center gap-2">
                                        <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                                        Signing in...
                                    </span>
                                ) : (
                                    'Sign in to BloodCare'
                                )}
                            </button>
                        </form>

                        <div className="text-center mt-6">
                            <p className="text-sm text-gray-600">
                                Don&apos;t have an account?{' '}
                                <Link to="/register" className="font-semibold text-red-600 hover:text-red-500 transition-colors">
                                    Register here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Login;
