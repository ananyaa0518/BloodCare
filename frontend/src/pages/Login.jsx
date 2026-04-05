import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Droplets, HeartPulse, ShieldCheck } from 'lucide-react';
import { API_URL } from '../config';

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
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data));
                navigate('/dashboard', { replace: true });
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again later.');
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

                        {error && (
                            <div className="mt-6 bg-red-50/90 text-red-700 px-4 py-3 rounded-lg border border-red-200 text-sm font-medium flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        )}

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
