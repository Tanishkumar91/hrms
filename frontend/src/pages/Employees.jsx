import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Trash2, Download, Loader2, Filter } from 'lucide-react';
import Modal from '../components/Modal';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Employees = () => {
    const { api } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'employee',
        employeeId: '', designation: '', department: '',
        dateOfJoining: new Date().toISOString().split('T')[0],
        salary: { base: 0, allowances: 0, deductions: 0 }
    });

    const fetchEmployees = async () => {
        try {
            const res = await api.get(`/employees?search=${searchTerm}`);
            setEmployees(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, [searchTerm]);

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        try {
            await api.post('/employees', formData);
            setIsModalOpen(false);
            fetchEmployees();
            setFormData({
                name: '', email: '', password: '', role: 'employee',
                employeeId: '', designation: '', department: '',
                dateOfJoining: new Date().toISOString().split('T')[0],
                salary: { base: 0, allowances: 0, deductions: 0 }
            });
            toast.success('Employee added successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error adding employee');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            try {
                await api.delete(`/employees/${id}`);
                fetchEmployees();
                toast.success('Employee removed.');
            } catch (err) {
                toast.error('Error deleting employee');
            }
        }
    };

    const exportToCSV = () => {
        const headers = ['Employee ID', 'Name', 'Email', 'Designation', 'Department', 'Joining Date', 'Status'];
        const rows = employees.map(emp => [
            `"${emp.employeeId}"`,
            `"${emp.user?.name || ''}"`,
            `"${emp.user?.email || ''}"`,
            `"${emp.designation || ''}"`,
            `"${emp.department || ''}"`,
            `"${new Date(emp.dateOfJoining).toLocaleDateString()}"`,
            `"${emp.user?.status || ''}"`
        ]);

        const csvContent = "\uFEFF" // UTF-8 BOM for Excel
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `employees_report_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredEmployees = employees.filter(emp => {
        if (statusFilter === 'All') return true;
        return emp.todayStatus === statusFilter;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Employee Management</h2>
                    <p className="text-slate-500 dark:text-slate-400">View and manage your workforce</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={exportToCSV}
                        className="flex items-center space-x-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
                    >
                        <Download size={18} />
                        <span>Export CSV</span>
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                        <Plus size={18} />
                        <span>Add Employee</span>
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div className="relative w-72">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                            <Search size={18} />
                        </span>
                        <input 
                            type="text" 
                            placeholder="Search by name, ID or dept..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-transparent focus:border-primary-500 rounded-lg outline-none text-sm transition-all"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-primary-200 dark:border-primary-800/60 rounded-xl bg-white dark:bg-slate-900 shadow-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-sm font-semibold text-primary-700 dark:text-primary-400 transition-all cursor-pointer appearance-none pr-8 relative"
                        style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236366f1%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem top 50%', backgroundSize: '0.65rem auto' }}
                    >
                        <option value="All">All Attendance</option>
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Not Marked">Not Marked</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Designation</th>
                                <th className="px-6 py-4">Department</th>
                                <th className="px-6 py-4">Account Status</th>
                                <th className="px-6 py-4">Today's Attendance</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                                        <Loader2 className="animate-spin inline mr-2" size={20} />
                                        Loading employees...
                                    </td>
                                </tr>
                            ) : filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-400">No employees found</td>
                                </tr>
                            ) : filteredEmployees.map((emp) => (
                                <tr key={emp._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 font-bold">
                                                {emp.user?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{emp.user?.name}</p>
                                                <p className="text-xs text-slate-500">{emp.employeeId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{emp.designation}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{emp.department}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                            emp.user?.status === 'active' 
                                            ? 'bg-green-100 text-green-600' 
                                            : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {emp.user?.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                            emp.todayStatus === 'Present' ? 'bg-green-100 text-green-600 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                                            emp.todayStatus === 'Absent' ? 'bg-orange-100 text-orange-600 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' :
                                            emp.todayStatus === 'On Leave' ? 'bg-yellow-100 text-yellow-600 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800' :
                                            'bg-red-100 text-red-600 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' // This covers "Not Marked"
                                        }`}>
                                            {emp.todayStatus || 'Not Marked'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleDelete(emp._id)}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="Add New Employee"
            >
                <form onSubmit={handleAddEmployee} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Full Name</label>
                        <input 
                            type="text" required
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary-500"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Email</label>
                        <input 
                            type="email" required
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary-500"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Password</label>
                        <input 
                            type="password" required
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary-500"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Employee ID</label>
                        <input 
                            type="text" required
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary-500"
                            value={formData.employeeId}
                            onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Designation</label>
                        <input 
                            type="text" required
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary-500"
                            value={formData.designation}
                            onChange={(e) => setFormData({...formData, designation: e.target.value})}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Department</label>
                        <input 
                            type="text" required
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary-500"
                            value={formData.department}
                            onChange={(e) => setFormData({...formData, department: e.target.value})}
                        />
                    </div>
                    <div className="md:col-span-2 pt-4">
                        <button 
                            type="submit"
                            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all"
                        >
                            Save Employee
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Employees;
