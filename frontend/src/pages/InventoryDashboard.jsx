import React, { useState, useEffect, useMemo } from 'react';
import { Plus, AlertTriangle, Activity, Droplet } from 'lucide-react';
import AddStockModal from '../components/AddStockModal';
import { API_URL } from '../config';

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
            const res = await fetch(`${API_URL}/api/inventory`);
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
            const res = await fetch(`${API_URL}/api/inventory/${id}`, { method: 'DELETE' });
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
        <div className="page-wrap space-y-6">
            {/* Header Section */}
            <div className="content-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-400 opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                        <span className="p-2.5 bg-red-100 rounded-2xl shadow-inner">
                            <Droplet className="text-red-500 fill-red-500" size={36} />
                        </span>
                        Blood Inventory
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg font-medium">Real-time tracking of blood availability and collection units.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="relative z-10 btn-primary px-6 py-3.5 rounded-xl font-bold text-base flex items-center gap-2"
                >
                    <Plus size={22} strokeWidth={3} />
                    Add New Stock
                </button>
            </div>

            {/* Aggregated Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {aggregatedData.map(data => (
                    <div key={data.type} className="glass p-6 rounded-3xl border border-white hover:border-red-200 transition-all duration-300 flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 cursor-pointer">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-white/40 rounded-full blur-xl translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="text-6xl font-black text-slate-800 mb-3 group-hover:scale-110 group-hover:text-red-600 transition-all duration-300 drop-shadow-sm">
                            {data.type}
                        </div>
                        <div className="text-3xl font-black text-slate-700 mb-4 tracking-tight">{data.units} <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">units</span></div>
                        <span className={`px-5 py-2 rounded-xl text-sm font-black border ${data.color} w-full text-center tracking-widest uppercase shadow-sm`}>
                            {data.status}
                        </span>
                    </div>
                ))}
            </div>

            {/* Expiring / Critical Units Section */}
            {expiringItems.length > 0 && (
                <div className="content-card p-0 overflow-hidden">
                    <div className="bg-gradient-to-r from-red-50 to-red-100/50 px-8 py-5 flex items-center gap-3 border-b border-red-100">
                        <div className="p-2 bg-red-200/50 rounded-xl">
                            <AlertTriangle className="text-red-600" size={24} />
                        </div>
                        <h2 className="text-xl font-black text-red-900 tracking-tight">Urgent: Expiring Units (≤ 3 Days)</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/40 text-slate-500 text-sm uppercase tracking-wider border-b-2 border-slate-100">
                                    <th className="p-5 font-black">Blood Group</th>
                                    <th className="p-5 font-black">Units</th>
                                    <th className="p-5 font-black">Collection Date</th>
                                    <th className="p-5 font-black text-red-600">Expiry Date</th>
                                    <th className="p-5 font-black text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white/60 divide-y divide-slate-100/50">
                                {expiringItems.map(item => {
                                    const isExpired = new Date(item.expiry_date) < new Date(new Date().setHours(0, 0, 0, 0));
                                    return (
                                        <tr key={item.id} className="hover:bg-red-50/50 transition-colors group">
                                            <td className="p-5 font-black text-xl text-slate-800">
                                                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 group-hover:border-red-200 transition-colors">
                                                    {item.blood_group}
                                                </span>
                                            </td>
                                            <td className="p-5 font-bold text-slate-700 text-lg">{item.units}</td>
                                            <td className="p-5 text-slate-500 font-semibold">{new Date(item.collection_date).toLocaleDateString()}</td>
                                            <td className="p-5">
                                                <span className={`font-black inline-flex items-center gap-2 px-4 py-2 rounded-lg ${isExpired ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                                                    {new Date(item.expiry_date).toLocaleDateString()}
                                                    {isExpired && <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-black tracking-widest uppercase shadow-sm">Expired</span>}
                                                </span>
                                            </td>
                                            <td className="p-5 text-right">
                                                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-white font-bold text-sm bg-red-50 border border-red-200 hover:bg-red-600 px-4 py-2 rounded-xl transition-all shadow-sm">
                                                    Discard Unit
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
