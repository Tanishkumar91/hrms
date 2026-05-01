import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    Users, 
    CalendarClock, 
    Briefcase, 
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Loader2
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const { api, user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const endpoint = (user?.role === 'hr') ? '/dashboard/stats' : '/dashboard/stats/me';
                const res = await api.get(endpoint);
                setStats(res.data.data);
            } catch (err) {
                console.error('Failed to fetch dashboard stats');
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchStats();
    }, [user]);

    if (!user) return null;

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-primary-600" size={32} />
        </div>
    );

    // Manager View
    if (user?.role === 'hr') {
        const kpis = [
            { title: 'Total Employees', value: stats?.totalEmployees || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', trend: '+12%', up: true },
            { title: 'Present Today', value: stats?.presentToday || 0, icon: CalendarClock, color: 'text-green-600', bg: 'bg-green-100', trend: '+5%', up: true },
            { title: 'Pending Leaves', value: stats?.pendingLeaves || 0, icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-100', trend: '-2%', up: false },
            { title: 'Active Users', value: stats?.activeUsers || 0, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100', trend: '+8%', up: true },
        ];

        const chartData = stats?.chartData || [];

        const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Manager Dashboard</h2>
                        <p className="text-slate-500 dark:text-slate-400">Welcome back, {user?.name}</p>
                    </div>
                    <div className="text-sm font-medium text-slate-500 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                        {new Date().toDateString()}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {kpis.map((kpi, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${kpi.bg} p-3 rounded-xl`}>
                                    <kpi.icon className={kpi.color} size={24} />
                                </div>
                                <div className={`flex items-center text-xs font-bold ${kpi.up ? 'text-green-500' : 'text-red-500'}`}>
                                    {kpi.trend}
                                    {kpi.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                </div>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{kpi.title}</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{kpi.value}</h3>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <h3 className="text-lg font-bold mb-6">Attendance Trends</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAtt)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <h3 className="text-lg font-bold mb-6">Leave Distribution</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats?.leaveStats || []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="_id"
                                    >
                                        {stats?.leaveStats?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Employee View
    const empKpis = [
        { title: 'My Total Leaves', value: stats?.myLeaves || 0, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100' },
        { title: 'Attendance Streak', value: stats?.streak || 0, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
        { title: 'Pending Issues', value: stats?.myIssues || 0, icon: Users, color: 'text-orange-600', bg: 'bg-orange-100' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Employee Dashboard</h2>
                    <p className="text-slate-500 dark:text-slate-400">Welcome back, {user?.name}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {empKpis.map((kpi, index) => (
                    <motion.div 
                        key={index}
                        className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm"
                    >
                        <div className={`${kpi.bg} p-3 rounded-xl w-fit mb-4`}>
                            <kpi.icon className={kpi.color} size={24} />
                        </div>
                        <p className="text-slate-500 text-sm font-medium">{kpi.title}</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{kpi.value}</h3>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => navigate('/attendance')}
                            className="p-4 bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/50 rounded-xl text-left hover:bg-primary-100 transition-colors"
                        >
                            <CalendarClock className="text-primary-600 mb-2" />
                            <p className="font-bold text-slate-900 dark:text-white">Mark Attendance</p>
                            <p className="text-xs text-slate-500">Check in for today</p>
                        </button>
                        <button 
                            onClick={() => navigate('/leaves')}
                            className="p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/50 rounded-xl text-left hover:bg-orange-100 transition-colors"
                        >
                            <Briefcase className="text-orange-600 mb-2" />
                            <p className="font-bold text-slate-900 dark:text-white">Request Leave</p>
                            <p className="text-xs text-slate-500">Submit new request</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
