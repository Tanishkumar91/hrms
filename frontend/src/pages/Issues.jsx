import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, MessageSquare, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import Modal from '../components/Modal';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Issues = () => {
    const { api, user } = useAuth();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', priority: 'medium' });

    const fetchIssues = async () => {
        try {
            const endpoint = (user?.role === 'hr') ? '/issues' : '/issues/me';
            const res = await api.get(endpoint);
            setIssues(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/issues', formData);
            setIsModalOpen(false);
            fetchIssues();
            setFormData({ title: '', description: '', priority: 'medium' });
            toast.success('Issue reported successfully!');
        } catch (err) {
            toast.error('Error submitting issue');
        }
    };

    const handleResolve = async (id, status) => {
        try {
            await api.put(`/issues/${id}`, { status });
            fetchIssues();
            toast.success('Issue marked as resolved!');
        } catch (err) {
            toast.error('Error updating issue');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Support & Issues</h2>
                    <p className="text-slate-500 dark:text-slate-400">Report concerns or request HR support</p>
                </div>
                {user.role === 'employee' && (
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                        <Plus size={18} />
                        <span>Report Issue</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    <div className="col-span-2 text-center py-12"><Loader2 className="animate-spin inline mr-2" /> Loading...</div>
                ) : issues.length === 0 ? (
                    <div className="col-span-2 text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">No issues found</div>
                ) : (
                    issues.map((issue) => (
                        <motion.div 
                            key={issue._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                    issue.priority === 'high' ? 'bg-red-100 text-red-600' : 
                                    issue.priority === 'medium' ? 'bg-orange-100 text-orange-600' : 
                                    'bg-blue-100 text-blue-600'
                                }`}>
                                    {issue.priority} priority
                                </span>
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                    issue.status === 'open' ? 'bg-slate-100 text-slate-600' : 
                                    issue.status === 'resolved' ? 'bg-green-100 text-green-600' : 
                                    'bg-blue-100 text-blue-600'
                                }`}>
                                    {issue.status}
                                </span>
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-1">{issue.title}</h4>
                            {(user?.role === 'hr') && (
                                <p className="text-[10px] font-bold text-primary-600 mb-2 uppercase tracking-wider flex items-center">
                                    <MessageSquare size={12} className="mr-1" />
                                    Reported by: {issue.employee?.user?.name || 'Unknown'}
                                </p>
                            )}
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{issue.description}</p>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700">
                                <p className="text-xs text-slate-400">Created {new Date(issue.createdAt).toLocaleDateString()}</p>
                                {(user?.role === 'hr') && issue.status === 'open' && (
                                    <button 
                                        onClick={() => handleResolve(issue._id, 'resolved')}
                                        className="text-xs font-bold text-green-600 hover:underline"
                                    >
                                        Mark as Resolved
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Report New Issue">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Title</label>
                        <input 
                            type="text" required
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Description</label>
                        <textarea 
                            required rows="4"
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        ></textarea>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Priority</label>
                        <select 
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                            value={formData.priority}
                            onChange={(e) => setFormData({...formData, priority: e.target.value})}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all">
                        Submit Issue
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default Issues;
