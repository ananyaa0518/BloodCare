import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

function EmergencyRequestForm() {
    const [formData, setFormData] = useState({
        blood_type: 'A+',
        units_required: 1,
        urgency_level: 'Critical',
        hospital_name: '',
        contact: ''
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        const token = localStorage.getItem('token');
        if (!token) {
            setError("You must be logged in as Hospital Staff to submit a request.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    blood_type: formData.blood_type,
                    units_required: parseInt(formData.units_required),
                    urgency_level: formData.urgency_level,
                    hospital_name: formData.hospital_name,
                    contact: formData.contact
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit request');
            }

            setSuccess("Emergency Request Submitted Successfully!");

            // clear form
            setFormData({
                blood_type: 'A+',
                units_required: 1,
                urgency_level: 'Critical',
                hospital_name: '',
                contact: ''
            });

            // Navigate to lists after brief delay
            setTimeout(() => navigate('/requests'), 2000);

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="flex items-center justify-center py-6 px-4 sm:px-6">
            <div className="max-w-2xl w-full relative z-10">
                {/* Decorative emergency blobs */}
                <div className="absolute -top-10 -left-10 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-rose-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>

                <div className="relative glass p-10 sm:p-12 rounded-3xl shadow-2xl border border-red-100 backdrop-blur-xl">
                    <div className="text-center mb-8">
                        <span className="inline-flex items-center justify-center p-3 bg-red-100 text-red-600 rounded-2xl mb-4 shadow-sm animate-bounce">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </span>
                        <h2 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-red-700 to-rose-500 tracking-tight">Raise Emergency Request</h2>
                        <p className="mt-2 text-slate-600 font-medium">Broadcast an urgent requirement to donors and staff immediately.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50/90 text-red-700 p-4 mb-6 rounded-xl border border-red-200 flex items-start gap-3 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-semibold">{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="bg-emerald-50/90 text-emerald-700 p-4 mb-6 rounded-xl border border-emerald-200 flex items-start gap-3 shadow-sm transform transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-semibold">{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Blood Type Needed</label>
                                <select
                                    name="blood_type"
                                    value={formData.blood_type}
                                    onChange={handleChange}
                                    className="input-field bg-white shadow-sm"
                                    required
                                >
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Units Required</label>
                                <input
                                    type="number"
                                    name="units_required"
                                    min="1"
                                    value={formData.units_required}
                                    onChange={handleChange}
                                    className="input-field shadow-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                            <label className="block text-sm font-bold text-slate-700 mb-3">Urgency Level</label>
                            <div className="flex flex-wrap gap-4">
                                {['Critical', 'High', 'Normal'].map(level => {
                                    const colors = {
                                        Critical: 'bg-red-100 text-red-800 border-red-300 peer-checked:bg-red-600 peer-checked:text-white',
                                        High: 'bg-orange-100 text-orange-800 border-orange-300 peer-checked:bg-orange-500 peer-checked:text-white',
                                        Normal: 'bg-blue-100 text-blue-800 border-blue-300 peer-checked:bg-blue-500 peer-checked:text-white'
                                    };
                                    return (
                                        <label key={level} className="cursor-pointer relative">
                                            <input
                                                type="radio"
                                                name="urgency_level"
                                                value={level}
                                                checked={formData.urgency_level === level}
                                                onChange={handleChange}
                                                className="peer sr-only"
                                            />
                                            <div className={`px-5 py-2.5 rounded-xl border text-sm font-bold shadow-sm transition-all duration-200 active:scale-95 ${colors[level]}`}>
                                                {level}
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Hospital Name</label>
                            <input
                                type="text"
                                name="hospital_name"
                                value={formData.hospital_name}
                                onChange={handleChange}
                                className="input-field shadow-sm"
                                placeholder="e.g. City General Hospital"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Contact Details</label>
                            <input
                                type="text"
                                name="contact"
                                value={formData.contact}
                                onChange={handleChange}
                                className="input-field shadow-sm"
                                placeholder="Phone number or specific ward details"
                                required
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full btn-primary h-14 text-lg font-black uppercase tracking-wider rounded-xl shadow-lg shadow-red-500/40 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500"
                            >
                                Submit Emergency Request
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default EmergencyRequestForm;
