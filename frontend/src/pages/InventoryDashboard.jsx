import React, { useState, useEffect, useMemo } from 'react';
import { Plus, AlertTriangle, Activity, Droplet } from 'lucide-react';
import AddStockModal from '../components/AddStockModal';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const CRITICAL_THRESHOLD = 5;
const LOW_THRESHOLD = 10;

const InventoryDashboard = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/inventory');
            if (!res.ok) throw new Error('Failed to fetch inventory');
            const data = await res.json();
            setInventory(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStock = (newStock) => {
        setInventory(prev => [newStock, ...prev]);
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/inventory/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete stock');
            setInventory(prev => prev.filter(item => item.id !== id));
        } catch (err) {
            alert(err.message);
        }
    };

    // Calculate aggregated inventory data
    const aggregatedData = useMemo(() => {
        const counts = BLOOD_TYPES.reduce((acc, type) => {
            acc[type] = 0;
            return acc;
        }, {});

        inventory.forEach(item => {
            if (counts[item.blood_group] !== undefined) {
                counts[item.blood_group] += item.units;
            }
        });

        return BLOOD_TYPES.map(type => {
            const units = counts[type];
            let status = 'Good';
            let color = 'bg-emerald-100 text-emerald-800 border-emerald-200';

            if (units < CRITICAL_THRESHOLD) {
                status = 'Critical';
                color = 'bg-red-100 text-red-800 border-red-200';
            } else if (units < LOW_THRESHOLD) {
                status = 'Low';
                color = 'bg-yellow-100 text-yellow-800 border-yellow-200';
            }

            return { type, units, status, color };
        });
    }, [inventory]);

    // Calculate expiring or expired units (older than 42 days)
    const expiringItems = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return inventory.filter(item => {
            const expiryDate = new Date(item.expiry_date);
            // Expired or expiring within 3 days
            const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
            return daysUntilExpiry <= 3;
        }).sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
    }, [inventory]);

    if (loading) return (
        <div className="flex justify-center items-center h-64 text-red-600 font-bold text-xl animate-pulse">
            <Activity className="mr-2 animate-spin" /> Loading Inventory...
        </div>
    );

    if (error) return (
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border-2 border-red-200 text-center font-bold">
            <AlertTriangle className="mx-auto mb-2" size={32} />
            Error: {error}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
                        <Droplet className="text-red-500 fill-red-500" size={32} />
                        Blood Inventory
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">Real-time tracking of blood availability and units.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                    <Plus size={20} />
                    Add Stock
                </button>
            </div>

            {/* Aggregated Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {aggregatedData.map(data => (
                    <div key={data.type} className="bg-white p-6 rounded-3xl shadow-sm border-2 border-gray-100 hover:border-red-200 transition-all flex flex-col items-center justify-center relative overflow-hidden group">
                        <div className="text-5xl font-black text-gray-900 mb-2 group-hover:scale-110 transition-transform">
                            {data.type}
                        </div>
                        <div className="text-3xl font-bold text-red-600 mb-4">{data.units} <span className="text-base text-gray-400 font-semibold">units</span></div>
                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${data.color} w-full text-center tracking-wide`}>
                            {data.status}
                        </span>
                    </div>
                ))}
            </div>

            {/* Expiring / Critical Units Section */}
            {expiringItems.length > 0 && (
                <div className="bg-white rounded-3xl shadow-sm border border-red-100 overflow-hidden">
                    <div className="bg-red-50 px-6 py-4 flex items-center gap-2 border-b border-red-100">
                        <AlertTriangle className="text-red-600" />
                        <h2 className="text-xl font-bold text-red-900">Urgent: Expiring Units (≤ 3 Days)</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 border-b-2 border-gray-100">
                                    <th className="p-4 font-bold">Blood Group</th>
                                    <th className="p-4 font-bold">Units</th>
                                    <th className="p-4 font-bold">Collection Date</th>
                                    <th className="p-4 font-bold text-red-600">Expiry Date</th>
                                    <th className="p-4 font-bold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expiringItems.map(item => {
                                    const isExpired = new Date(item.expiry_date) < new Date(new Date().setHours(0, 0, 0, 0));
                                    return (
                                        <tr key={item.id} className="border-b border-gray-50 hover:bg-red-50/30 transition-colors">
                                            <td className="p-4 font-black text-lg text-gray-800">{item.blood_group}</td>
                                            <td className="p-4 font-semibold text-gray-700">{item.units}</td>
                                            <td className="p-4 text-gray-500 font-medium">{new Date(item.collection_date).toLocaleDateString()}</td>
                                            <td className="p-4">
                                                <span className={`font-bold inline-flex items-center gap-1 ${isExpired ? 'text-red-600' : 'text-amber-600'}`}>
                                                    {new Date(item.expiry_date).toLocaleDateString()}
                                                    {isExpired && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full ml-2">EXPIRED</span>}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 font-bold text-sm bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                                                    Discard
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <AddStockModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddStock}
            />
        </div>
    );
};

export default InventoryDashboard;
