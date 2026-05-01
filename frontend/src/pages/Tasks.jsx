import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    Plus, CheckCircle2, Clock, Trash2, 
    Loader2, ClipboardList, TrendingUp, 
    Calendar, ArrowUp, ArrowDown, Download
} from 'lucide-react';
import Modal from '../components/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const PRIORITY_COLORS = {
    low:      'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
    medium:   'bg-yellow-100 text-yellow-600 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400',
    high:     'bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400',
    critical: 'bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400',
};

const STATUS_COLORS = {
    pending:       'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
    'in-progress': 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    completed:     'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    overdue:       'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

const Tasks = () => {
    const { api, user } = useAuth();
    const isHR = user?.role === 'hr';

    const [tasks, setTasks]             = useState([]);
    const [employees, setEmployees]     = useState([]);
    const [perfData, setPerfData]       = useState([]);
    const [loading, setLoading]         = useState(true);
    const [activeTab, setActiveTab]     = useState('tasks');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortOrder, setSortOrder]     = useState('desc'); // 'asc' | 'desc'

    const [formData, setFormData] = useState({
        title: '', description: '', assignedTo: '', priority: 'medium',
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
    });

    const fetchTasks = async () => {
        try {
            const res = await api.get(isHR ? '/tasks' : '/tasks/me');
            setTasks(res.data.data);
        } catch { toast.error('Could not load tasks'); }
        finally { setLoading(false); }
    };

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/employees?limit=100');
            setEmployees(res.data.data);
        } catch {}
    };

    const fetchPerformance = async () => {
        try {
            const res = await api.get('/tasks/performance');
            setPerfData(res.data.data);
        } catch {}
    };

    useEffect(() => {
        fetchTasks();
        if (isHR) { fetchEmployees(); fetchPerformance(); }
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tasks', formData);
            setIsModalOpen(false);
            fetchTasks();
            fetchPerformance();
            toast.success('Task assigned successfully!');
            setFormData({ title: '', description: '', assignedTo: '', priority: 'medium',
                dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0] });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error assigning task');
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await api.put(`/tasks/${taskId}/status`, { status: newStatus });
            fetchTasks();
            if (isHR) fetchPerformance();
            toast.success(`Task marked as ${newStatus}!`);
        } catch {
            toast.error('Error updating task status');
        }
    };

    const handleDelete = async (taskId) => {
        try {
            await api.delete(`/tasks/${taskId}`);
            fetchTasks();
            fetchPerformance();
            toast.success('Task deleted.');
        } catch {
            toast.error('Error deleting task');
        }
    };

    const filtered = statusFilter === 'all' ? tasks : tasks.filter(t => t.status === statusFilter);

    // Sort performance data by completionRate
    const sortedPerf = [...perfData].sort((a, b) =>
        sortOrder === 'desc'
            ? b.completionRate - a.completionRate
            : a.completionRate - b.completionRate
    );

    const exportToExcel = () => {
        const headers = ['Employee Name', 'Department', 'Total Assigned', 'Completed', 'In Progress', 'Overdue', 'Pending', 'Completion %'];
        const rows = sortedPerf.map(entry => [
            `"${entry.employee?.user?.name || ''}"`  ,
            `"${entry.employee?.department || entry.employee?.designation || ''}"`  ,
            entry.totalAssigned,
            entry.completed,
            entry.inProgress,
            entry.overdue,
            entry.pending,
            entry.completionRate
        ]);

        const csvContent = "\uFEFF" // UTF-8 BOM for Excel
            + headers.join(',') + '\n'
            + rows.map(r => r.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Task_Performance_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Performance report downloaded!');
    };

    const getCompletionColor = (rate) => {
        if (rate >= 75) return 'text-green-600 dark:text-green-400';
        if (rate >= 40) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-500 dark:text-red-400';
    };

    const getBarColor = (rate) => {
        if (rate >= 75) return 'bg-green-500';
        if (rate >= 40) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {isHR ? 'Task Management' : 'My Tasks'}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        {isHR ? 'Assign tasks and track employee performance' : 'View and update your assigned tasks'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {isHR && (
                        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                            {['tasks', 'performance'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                                        activeTab === tab
                                        ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400'
                                    }`}
                                >
                                    {tab === 'performance' ? '📊 Analytics' : '📋 Tasks'}
                                </button>
                            ))}
                        </div>
                    )}
                    {isHR && activeTab === 'tasks' && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-primary-200 dark:shadow-none"
                        >
                            <Plus size={18} />
                            <span>Assign Task</span>
                        </button>
                    )}
                </div>
            </div>

            {/* ── Performance Analytics Tab ── */}
            {isHR && activeTab === 'performance' && (
                <div className="space-y-4">
                    {/* Header + Sort control */}
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <TrendingUp size={18} className="text-primary-500" />
                            <span className="font-semibold text-sm">
                                {sortedPerf.length} employee{sortedPerf.length !== 1 ? 's' : ''} with assigned tasks
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Sort toggle */}
                            <button
                                onClick={() => setSortOrder(o => o === 'desc' ? 'asc' : 'desc')}
                                className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:border-primary-400 transition-colors"
                            >
                                {sortOrder === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                                {sortOrder === 'desc' ? 'Highest First' : 'Lowest First'}
                            </button>
                            {/* Excel export */}
                            <button
                                onClick={exportToExcel}
                                disabled={sortedPerf.length === 0}
                                className="flex items-center gap-2 px-3 py-1.5 border border-green-200 dark:border-green-800/60 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-semibold hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <Download size={14} />
                                Export Excel
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    {sortedPerf.length === 0 ? (
                        <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400">
                            <ClipboardList className="mx-auto mb-3 opacity-40" size={48} />
                            <p className="font-medium">No tasks assigned yet</p>
                            <p className="text-sm mt-1">Switch to Tasks tab and assign some!</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100 dark:border-slate-700">
                                        <tr>
                                            <th className="px-6 py-4">Employee</th>
                                            <th className="px-6 py-4 text-center">Total Assigned</th>
                                            <th className="px-6 py-4 text-center">Completed</th>
                                            <th className="px-6 py-4 text-center">In Progress</th>
                                            <th className="px-6 py-4 text-center">Overdue</th>
                                            <th className="px-6 py-4 text-center">Pending</th>
                                            <th className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => setSortOrder(o => o === 'desc' ? 'asc' : 'desc')}
                                                    className="flex items-center gap-1 mx-auto hover:text-primary-500 transition-colors"
                                                >
                                                    Completion %
                                                    {sortOrder === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />}
                                                </button>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {sortedPerf.map((entry, idx) => (
                                            <motion.tr
                                                key={entry.employee?._id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.04 }}
                                                className="hover:bg-slate-50/60 dark:hover:bg-slate-700/20 transition-colors"
                                            >
                                                {/* Employee */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-sm flex-shrink-0">
                                                            {entry.employee?.user?.name?.charAt(0)?.toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-sm text-slate-900 dark:text-white">{entry.employee?.user?.name}</p>
                                                            <p className="text-xs text-slate-400">{entry.employee?.department || entry.employee?.designation}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Total */}
                                                <td className="px-6 py-4 text-center">
                                                    <span className="font-bold text-slate-700 dark:text-slate-200">{entry.totalAssigned}</span>
                                                </td>
                                                {/* Completed */}
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                        {entry.completed}
                                                    </span>
                                                </td>
                                                {/* In Progress */}
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                        {entry.inProgress}
                                                    </span>
                                                </td>
                                                {/* Overdue */}
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                        {entry.overdue}
                                                    </span>
                                                </td>
                                                {/* Pending */}
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                                        {entry.pending}
                                                    </span>
                                                </td>
                                                {/* Completion % */}
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
                                                        <span className={`text-sm font-bold ${getCompletionColor(entry.completionRate)}`}>
                                                            {entry.completionRate}%
                                                        </span>
                                                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all ${getBarColor(entry.completionRate)}`}
                                                                style={{ width: `${entry.completionRate}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Tasks Tab ── */}
            {(!isHR || activeTab === 'tasks') && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                        {['all', 'pending', 'in-progress', 'completed', 'overdue'].map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
                                    statusFilter === s
                                    ? 'bg-primary-600 text-white border-primary-600'
                                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary-400'
                                }`}
                            >
                                {s === 'all' ? 'All Tasks' : s.replace('-', ' ')}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16 text-slate-400">
                            <Loader2 className="animate-spin mr-2" size={24} />
                            Loading tasks...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400">
                            <ClipboardList className="mx-auto mb-3 opacity-40" size={48} />
                            <p className="font-medium">No tasks found</p>
                            {isHR && <p className="text-sm mt-1">Click "Assign Task" to get started</p>}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <AnimatePresence>
                                {filtered.map((task) => (
                                    <motion.div
                                        key={task._id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.97 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 flex flex-col gap-3"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`font-bold text-slate-900 dark:text-white leading-tight ${
                                                    task.status === 'completed' ? 'line-through opacity-60' : ''
                                                }`}>{task.title}</h4>
                                                {isHR && (
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-[10px] font-bold flex-shrink-0">
                                                            {task.assignedTo?.user?.name?.charAt(0)?.toUpperCase()}
                                                        </div>
                                                        <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 truncate">
                                                            {task.assignedTo?.user?.name || 'Unknown Employee'}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${PRIORITY_COLORS[task.priority]}`}>
                                                    {task.priority}
                                                </span>
                                                {isHR && (
                                                    <button onClick={() => handleDelete(task._id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {task.description && (
                                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{task.description}</p>
                                        )}

                                        <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                Due {new Date(task.dueDate).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-100 dark:border-slate-700">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${STATUS_COLORS[task.status]}`}>
                                                {task.status.replace('-', ' ')}
                                            </span>
                                            {!isHR && task.status !== 'completed' && (
                                                <div className="flex gap-2">
                                                    {task.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleStatusChange(task._id, 'in-progress')}
                                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-colors"
                                                        >
                                                            <Clock size={14} /> Start
                                                        </button>
                                                    )}
                                                    {task.status === 'in-progress' && (
                                                        <button
                                                            onClick={() => handleStatusChange(task._id, 'completed')}
                                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 text-xs font-semibold hover:bg-green-100 transition-colors"
                                                        >
                                                            <CheckCircle2 size={14} /> Complete
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                            {isHR && task.status !== 'completed' && (
                                                <select
                                                    value={task.status}
                                                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                                    className="text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:border-primary-500"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="in-progress">In Progress</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="overdue">Overdue</option>
                                                </select>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            )}

            {/* ── Assign Task Modal ── */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign New Task">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Task Title</label>
                        <input
                            type="text" required
                            placeholder="e.g. Prepare Q2 sales report"
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary-500 text-sm"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Description (optional)</label>
                        <textarea
                            rows="3"
                            placeholder="Describe what needs to be done..."
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary-500 text-sm resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Assign To</label>
                            <select
                                required
                                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary-500 text-sm"
                                value={formData.assignedTo}
                                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                            >
                                <option value="">Select employee...</option>
                                {employees.map(emp => (
                                    <option key={emp._id} value={emp._id}>
                                        {emp.user?.name} — {emp.todayStatus || 'Unknown'}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Priority</label>
                            <select
                                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary-500 text-sm"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="low">🔵 Low</option>
                                <option value="medium">🟡 Medium</option>
                                <option value="high">🟠 High</option>
                                <option value="critical">🔴 Critical</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Due Date</label>
                        <input
                            type="date" required
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary-500 text-sm"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-200 dark:shadow-none"
                    >
                        Assign Task
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default Tasks;
