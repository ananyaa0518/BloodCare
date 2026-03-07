import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddStockModal = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        blood_group: 'A+',
        units: 1,
        collection_date: new Date().toISOString().split('T')[0]
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    blood_group: formData.blood_group,
                    units: parseInt(formData.units),
                    collection_date: formData.collection_date
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to add stock');
            }

            const newStock = await response.json();
            onAdd(newStock);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
                <div className="bg-red-600 px-6 py-4 flex justify-between items-center text-white">
                    <h3 className="text-xl font-bold">Add New Blood Stock</h3>
                    <button onClick={onClose} className="hover:bg-red-700 p-1 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Blood Group</label>
                        <select
                            name="blood_group"
                            value={formData.blood_group}
                            onChange={handleChange}
                            className="w-full border-2 border-gray-200 rounded-lg p-3 focus:outline-none focus:border-red-500 bg-gray-50 text-gray-800 transition-colors"
                            required
                        >
                            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Units (Bags)</label>
                        <input
                            type="number"
                            name="units"
                            value={formData.units}
                            onChange={handleChange}
                            min="1"
                            max="50"
                            className="w-full border-2 border-gray-200 rounded-lg p-3 focus:outline-none focus:border-red-500 bg-gray-50 text-gray-800 transition-colors"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Collection Date</label>
                        <input
                            type="date"
                            name="collection_date"
                            value={formData.collection_date}
                            onChange={handleChange}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full border-2 border-gray-200 rounded-lg p-3 focus:outline-none focus:border-red-500 bg-gray-50 text-gray-800 transition-colors"
                            required
                        />
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                        * Expiry date will be automatically set to 42 days from collection.
                    </p>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-md transition-all disabled:opacity-70"
                        >
                            {loading ? 'Adding...' : 'Add Stock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStockModal;
