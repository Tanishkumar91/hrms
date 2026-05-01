import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Download, Loader2, PlayCircle, DollarSign, CheckCircle, Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const Payroll = () => {
    const { api, user } = useAuth();
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState(null);
    const [newSalary, setNewSalary] = useState('');

    const fetchPayroll = async () => {
        try {
            const endpoint = (user?.role === 'hr') ? '/payroll/all' : '/payroll/me';
            const res = await api.get(endpoint);
            setPayrolls(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayroll();
    }, []);

    const handleGeneratePayroll = async () => {
        setGenerating(true);
        try {
            const now = new Date();
            await api.post('/payroll/generate', { 
                month: now.getMonth() + 1, 
                year: now.getFullYear() 
            });
            fetchPayroll();
            toast.success('Payroll generated successfully!');
        } catch (err) {
            toast.error('Error generating payroll');
        } finally {
            setGenerating(false);
        }
    };

    const handleUpdatePayroll = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/payroll/${selectedPayroll._id}`, { 
                baseSalary: Number(newSalary)
                // You can add fields for allowances/deductions here too
            });
            setIsSalaryModalOpen(false);
            fetchPayroll();
            toast.success('Payroll updated successfully!');
        } catch (err) {
            toast.error('Error updating payroll');
        }
    };

    const handleToggleStatus = async (p) => {
        const newStatus = p.status === 'paid' ? 'pending' : 'paid';
        try {
            await api.put(`/payroll/${p._id}`, { status: newStatus });
            fetchPayroll();
            toast.success(`Payment status updated to ${newStatus}!`);
        } catch (err) {
            toast.error('Error updating status');
        }
    };

    const downloadPayslip = async (p) => {
        try {
            const response = await api.get(`/payroll/download/${p._id}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const filename = `Payslip-${p.employee?.user?.name || 'Employee'}-${p.month}-${p.year}.pdf`;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            toast.error('Error downloading payslip');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Payroll Management</h2>
                    <p className="text-slate-500 dark:text-slate-400">View and generate salary reports</p>
                </div>
                {(user?.role === 'hr') && (
                    <button 
                        onClick={handleGeneratePayroll}
                        disabled={generating}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                    >
                        {generating ? <Loader2 className="animate-spin" size={18} /> : <PlayCircle size={18} />}
                        <span>Generate Current Month</span>
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Period</th>
                                <th className="px-6 py-4">Net Salary</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                                        <Loader2 className="animate-spin inline mr-2" size={20} />
                                        Loading payroll data...
                                    </td>
                                </tr>
                            ) : payrolls.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400">No payroll records found</td>
                                </tr>
                            ) : payrolls.map((p) => (
                                <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                            {p.employee?.user?.name || 'Self'}
                                        </p>
                                        <p className="text-xs text-slate-500">{p.employee?.employeeId}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][p.month-1]} {p.year}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                                        ${p.netSalary.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                            p.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                        }`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            {(user?.role === 'hr') && (
                                                <>
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedPayroll(p);
                                                            setNewSalary(p.baseSalary);
                                                            setIsSalaryModalOpen(true);
                                                        }}
                                                        title="Edit Monthly Payroll"
                                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    >
                                                        <Edit3 size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleToggleStatus(p)}
                                                        title={p.status === 'paid' ? "Mark as Pending" : "Mark as Paid"}
                                                        className={`p-2 rounded-lg transition-colors ${
                                                            p.status === 'paid' 
                                                            ? 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20' 
                                                            : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                        }`}
                                                    >
                                                        {p.status === 'paid' ? <PlayCircle size={18} className="rotate-90" /> : <CheckCircle size={18} />}
                                                    </button>
                                                </>
                                            )}
                                            <button 
                                                onClick={() => downloadPayslip(p)}
                                                title="Download Payslip"
                                                className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                            >
                                                <Download size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isSalaryModalOpen} onClose={() => setIsSalaryModalOpen(false)} title="Adjust Monthly Payroll">
                <form onSubmit={handleUpdatePayroll} className="space-y-4">
                    <p className="text-sm text-slate-500">Adjusting salary for <span className="font-bold text-slate-900 dark:text-white">{selectedPayroll?.employee?.user?.name}</span> for {selectedPayroll?.month}/{selectedPayroll?.year}</p>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Base Salary Amount ($)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="number" required
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                                value={newSalary}
                                onChange={(e) => setNewSalary(e.target.value)}
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-200 dark:shadow-none">
                        Save Adjustments
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default Payroll;
