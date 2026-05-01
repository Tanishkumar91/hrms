import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock, LogIn, LogOut, Loader2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Attendance = () => {
    const { api, user } = useAuth();
    const [attendance, setAttendance] = useState([]);
    const [todayStatus, setTodayStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchAttendance = async () => {
        try {
            const endpoint = (user?.role === 'hr') ? '/attendance' : '/attendance/me';
            const res = await api.get(endpoint);
            setAttendance(res.data.data);
            
            // Find today's status for the employee
            if (user.role === 'employee') {
                const today = new Date().toISOString().split('T')[0];
                const todayRecord = res.data.data.find(record => 
                    new Date(record.date).toISOString().split('T')[0] === today
                );
                setTodayStatus(todayRecord || null);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, []);

    const handleCheckIn = async () => {
        setActionLoading(true);
        try {
            await api.post('/attendance/check-in');
            fetchAttendance();
            toast.success('✅ Checked in successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Check-in failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCheckOut = async () => {
        setActionLoading(true);
        try {
            await api.put('/attendance/check-out');
            fetchAttendance();
            toast.success('👋 Checked out successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Check-out failed');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance Tracking</h2>
                    <p className="text-slate-500 dark:text-slate-400">Manage your daily check-in/out times</p>
                </div>
            </div>

            {user.role === 'employee' && (
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 mb-4">
                        <Clock size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {todayStatus?.checkOut?.time ? 'Day Completed' : todayStatus?.checkIn?.time ? 'Currently Clocked In' : 'Ready to Start?'}
                    </h3>
                    <p className="text-slate-500 mb-8 max-w-xs">
                        {todayStatus?.checkIn?.time 
                            ? `You checked in at ${new Date(todayStatus.checkIn.time).toLocaleTimeString()}`
                            : "Don't forget to clock in to start your workday."}
                    </p>
                    
                    <div className="flex space-x-4">
                        {!todayStatus?.checkIn?.time && (
                            <button 
                                onClick={handleCheckIn}
                                disabled={actionLoading}
                                className="flex items-center space-x-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-200 dark:shadow-none"
                            >
                                {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
                                <span>Check In</span>
                            </button>
                        )}
                        {todayStatus?.checkIn?.time && !todayStatus?.checkOut?.time && (
                            <button 
                                onClick={handleCheckOut}
                                disabled={actionLoading}
                                className="flex items-center space-x-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-200 dark:shadow-none"
                            >
                                {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <LogOut size={20} />}
                                <span>Check Out</span>
                            </button>
                        )}
                        {todayStatus?.checkOut?.time && (
                            <div className="px-8 py-3 bg-slate-100 dark:bg-slate-700 text-slate-500 font-bold rounded-xl">
                                Completed for Today
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <Calendar size={18} />
                    <span>{user.role === 'employee' ? 'My History' : 'Employee Logs'}</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs uppercase font-semibold">
                            <tr>
                                {user.role !== 'employee' && <th className="px-6 py-4">Employee</th>}
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Check In</th>
                                <th className="px-6 py-4">Check Out</th>
                                <th className="px-6 py-4">Work Hours</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-8"><Loader2 className="animate-spin inline mr-2" /> Loading...</td></tr>
                            ) : attendance.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-8 text-slate-400">No records found</td></tr>
                            ) : attendance.map((record) => (
                                <tr key={record._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                                    {user.role !== 'employee' && (
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                                            {record.employee?.user?.name || 'Unknown'}
                                        </td>
                                    )}
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                        {new Date(record.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                        {record.checkIn?.time ? new Date(record.checkIn.time).toLocaleTimeString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                        {record.checkOut?.time ? new Date(record.checkOut.time).toLocaleTimeString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                                        {record.workHours?.toFixed(2) || '0.00'} hrs
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                            record.status === 'present' ? 'bg-green-100 text-green-600' : 
                                            record.status === 'late' ? 'bg-orange-100 text-orange-600' : 
                                            'bg-red-100 text-red-600'
                                        }`}>
                                            {record.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Attendance;
