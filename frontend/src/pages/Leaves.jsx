import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Check, X, Loader2, Calendar } from 'lucide-react';
import Modal from '../components/Modal';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Leaves = () => {
    const { api, user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        leaveType: 'sick',
        startDate: '',
        endDate: '',
        reason: ''
    });

    const fetchLeaves = async () => {
        try {
            const endpoint = (user?.role === 'hr') ? '/leaves' : '/leaves/me';
            const res = await api.get(endpoint);
            setLeaves(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleRequestLeave = async (e) => {
        e.preventDefault();
        try {
            await api.post('/leaves', formData);
            setIsModalOpen(false);
            fetchLeaves();
            setFormData({ leaveType: 'sick', startDate: '', endDate: '', reason: '' });
            toast.success('Leave request submitted successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error requesting leave');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.put(`/leaves/${id}`, { status });
            fetchLeaves();
            toast.success(`Leave ${status} successfully!`);
        } catch (err) {
            toast.error('Error updating leave status');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Leave Requests</h2>
                    <p className="text-slate-500 dark:text-slate-400">Track and manage time-off requests</p>
                </div>
                {user.role === 'employee' && (
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                        <Plus size={18} />
                        <span>Request Leave</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="flex items-center justify-center py-12 text-slate-400">
                        <Loader2 className="animate-spin mr-2" size={24} />
                        Loading requests...
                    </div>
                ) : leaves.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 p-12 text-center rounded-2xl border border-slate-100 dark:border-slate-700">
                        <Calendar className="mx-auto text-slate-300 mb-4" size={48} />
                        <p className="text-slate-500">No leave requests found</p>
                    </div>
                ) : (
                    leaves.map((leave) => (
                        <motion.div 
                            key={leave._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                            <div className="flex items-center space-x-4">
                                <div className={`p-3 rounded-xl ${
                                    leave.status === 'approved' ? 'bg-green-100 text-green-600' :
                                    leave.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                    'bg-orange-100 text-orange-600'
                                }`}>
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white capitalize">
                                        {leave.leaveType} Leave
                                    </h4>
                                    {(user?.role === 'hr') && (
                                        <p className="text-xs font-bold text-primary-600 uppercase tracking-tighter">
                                            Requested by: {leave.employee?.user?.name || 'Unknown'}
                                        </p>
                                    )}
                                    <p className="text-sm text-slate-500">
                                        {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1 italic">"{leave.reason}"</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                    leave.status === 'approved' ? 'bg-green-50 text-green-600' :
                                    leave.status === 'rejected' ? 'bg-red-50 text-red-600' :
                                    'bg-orange-50 text-orange-600'
                                }`}>
                                    {leave.status}
                                </span>
                                {(user?.role === 'hr') && leave.status === 'pending' && (
                                    <div className="flex space-x-2 ml-4">
                                        <button 
                                            onClick={() => handleStatusUpdate(leave._id, 'approved')}
                                            className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                                        >
                                            <Check size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleStatusUpdate(leave._id, 'rejected')}
                                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Leave Request">
                <form onSubmit={handleRequestLeave} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Leave Type</label>
                        <select 
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                            value={formData.leaveType}
                            onChange={(e) => setFormData({...formData, leaveType: e.target.value})}
                        >
                            <option value="sick">Sick Leave</option>
                            <option value="casual">Casual Leave</option>
                            <option value="paid">Paid Leave</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Start Date</label>
                            <input 
                                type="date" required
                                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                                value={formData.startDate}
                                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">End Date</label>
                            <input 
                                type="date" required
                                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                                value={formData.endDate}
                                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Reason</label>
                        <textarea 
                            required rows="3"
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                            value={formData.reason}
                            onChange={(e) => setFormData({...formData, reason: e.target.value})}
                        ></textarea>
                    </div>
                    <button type="submit" className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all">
                        Submit Request
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default Leaves;
