import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { API_URL } from '../config';

function NotificationBell({ user }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!user || user.role !== 'Donor') return;

        // Initialize Socket
        const newSocket = io(API_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
            newSocket.emit('user_connected', user.id);
        });

        newSocket.on('emergency_alert', (data) => {
            toast.error(data.message, {
                icon: '🚨',
                duration: 6000,
                style: { border: '2px solid #ef4444', backgroundColor: '#fee2e2' }
            });

            setNotifications(prev => [data, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        return () => newSocket.disconnect();
    }, [user]);

    const handleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setUnreadCount(0); // clear count on open
        }
    };

    const handleRespond = async (requestId) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/api/requests/${requestId}/respond`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            toast.success("Successfully registered your response!");
            // Optionally remove from list or mark as responded
            setNotifications(prev => prev.filter(n => n.request.id !== requestId));
            if (notifications.length === 1) setIsOpen(false); // Close if last one
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={handleOpen}
                className="relative p-2 hover:bg-red-700 rounded-full transition focus:outline-none"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-yellow-400 text-red-900 text-xs font-bold px-1.5 py-0.5 rounded-full transform translate-x-1 -translate-y-1">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-xl z-50 border border-gray-100 overflow-hidden transform origin-top-right transition-all">
                    <div className="bg-gray-50 px-4 py-3 border-b text-gray-700 font-semibold flex justify-between">
                        <span>Notifications</span>
                        <span className="text-xs font-normal opacity-70 cursor-pointer hover:underline" onClick={() => setNotifications([])}>Clear</span>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-sm text-gray-500">
                                No new notifications.
                            </div>
                        ) : (
                            notifications.map((notif, idx) => (
                                <div key={idx} className="p-4 border-b hover:bg-red-50/50 transition flex flex-col items-start text-left">
                                    <span className="text-xs font-bold text-red-600 mb-1 uppercase tracking-wider">Urgency: {notif.request.urgency_level}</span>
                                    <p className="text-sm text-gray-800 font-medium mb-2">{notif.message}</p>
                                    <span className="text-xs text-gray-500 mb-3">{new Date(notif.request.created_at).toLocaleString()}</span>

                                    <button
                                        onClick={() => handleRespond(notif.request.id)}
                                        className="text-xs bg-red-600 text-white font-bold px-3 py-1.5 rounded hover:bg-red-700"
                                    >
                                        I Can Donate
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationBell;
