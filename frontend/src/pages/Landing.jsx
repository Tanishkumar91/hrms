import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Building2, Users, CalendarCheck, CreditCard,
    Bell, ClipboardList, TrendingUp, Shield,
    ArrowRight, CheckCircle2, Zap, Globe
} from 'lucide-react';

const features = [
    { icon: Users,        title: 'Employee Management',   desc: 'Manage profiles, departments, designations and onboarding in one place.' },
    { icon: CalendarCheck,title: 'Attendance Tracking',   desc: 'Real-time check-in/check-out with daily attendance reports and filters.' },
    { icon: CreditCard,   title: 'Payroll Processing',    desc: 'Auto-generate monthly payslips, mark payments and download PDF reports.' },
    { icon: Bell,         title: 'Leave Management',      desc: 'Apply, approve and track leaves with instant in-app notifications.' },
    { icon: ClipboardList,title: 'Task Assignment',       desc: 'Assign tasks with priorities, track progress and view performance analytics.' },
    { icon: TrendingUp,   title: 'Performance Insights',  desc: 'Completion rate analytics with Excel export to identify top performers.' },
];

const stats = [
    { label: 'Modules',         value: '6+' },
    { label: 'Roles Supported', value: '2'  },
    { label: 'Real-time Alerts',value: '✓'  },
    { label: 'Excel Export',    value: '✓'  },
];

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } }
};

const Landing = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">

            {/* ── Navbar ── */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-900">
                            <Building2 size={16} className="text-white" />
                        </div>
                        <span className="text-lg font-bold text-white">HRMS <span className="text-primary-400">Pro</span></span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/login"
                            className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="px-4 py-2 text-sm font-semibold bg-primary-600 hover:bg-primary-500 text-white rounded-xl transition-all shadow-lg shadow-primary-900"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>

            {/* ── Hero ── */}
            <section className="relative pt-36 pb-28 px-6 overflow-hidden">
                {/* Background glow blobs */}
                <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary-600/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-40 right-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-950 border border-primary-800 rounded-full text-primary-400 text-xs font-semibold mb-6"
                    >
                        <Zap size={12} />
                        Production-Grade HR Platform
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight mb-6"
                    >
                        Manage your{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-blue-400">
                            entire workforce
                        </span>{' '}
                        from one dashboard
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto mb-10"
                    >
                        HRMS Pro handles attendance, payroll, leaves, tasks and performance analytics — so your HR team can focus on people, not paperwork.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex items-center justify-center gap-4 flex-wrap"
                    >
                        <Link
                            to="/register"
                            className="flex items-center gap-2 px-6 py-3.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary-900/50 text-sm"
                        >
                            Get Started Free <ArrowRight size={16} />
                        </Link>
                        <Link
                            to="/login"
                            className="flex items-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-2xl transition-all text-sm"
                        >
                            Login to Dashboard
                        </Link>
                    </motion.div>
                </div>

                {/* Stats strip */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="max-w-2xl mx-auto mt-16 grid grid-cols-4 gap-4"
                >
                    {stats.map((s) => (
                        <div key={s.label} className="text-center p-4 bg-white/5 border border-white/10 rounded-2xl">
                            <p className="text-2xl font-extrabold text-primary-400">{s.value}</p>
                            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                        </div>
                    ))}
                </motion.div>
            </section>

            {/* ── Features ── */}
            <section className="py-24 px-6 bg-slate-900/50">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial="hidden" whileInView="show" viewport={{ once: true }}
                        variants={fadeUp}
                        className="text-center mb-14"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            Everything your HR team needs
                        </h2>
                        <p className="text-slate-400 max-w-xl mx-auto">
                            Built for modern teams — from startups to enterprises. All modules work together seamlessly.
                        </p>
                    </motion.div>

                    <motion.div
                        initial="hidden" whileInView="show" viewport={{ once: true }}
                        variants={stagger}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {features.map((f) => (
                            <motion.div
                                key={f.title}
                                variants={fadeUp}
                                className="group p-6 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-primary-700/60 rounded-2xl transition-all duration-300 cursor-default"
                            >
                                <div className="w-10 h-10 rounded-xl bg-primary-900/60 group-hover:bg-primary-800/80 flex items-center justify-center mb-4 transition-colors">
                                    <f.icon size={20} className="text-primary-400" />
                                </div>
                                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── Roles CTA ── */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* HR Card */}
                    <motion.div
                        initial="hidden" whileInView="show" viewport={{ once: true }}
                        variants={fadeUp}
                        className="relative overflow-hidden p-8 bg-gradient-to-br from-primary-900/80 to-slate-900 border border-primary-700/40 rounded-3xl"
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl" />
                        <Shield size={32} className="text-primary-400 mb-4" />
                        <h3 className="text-xl font-bold mb-2">For HR Managers</h3>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                            Approve leaves, run payroll, assign tasks, track attendance and view performance insights — all in one view.
                        </p>
                        <ul className="space-y-2 mb-8">
                            {['Employee directory', 'Payroll generation', 'Task assignment', 'Analytics & export'].map(item => (
                                <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                                    <CheckCircle2 size={14} className="text-primary-400 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl transition-all text-sm">
                            Login as HR <ArrowRight size={15} />
                        </Link>
                    </motion.div>

                    {/* Employee Card */}
                    <motion.div
                        initial="hidden" whileInView="show" viewport={{ once: true }}
                        variants={{ ...fadeUp, show: { ...fadeUp.show, transition: { duration: 0.5, delay: 0.15 } } }}
                        className="relative overflow-hidden p-8 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 rounded-3xl"
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
                        <Globe size={32} className="text-blue-400 mb-4" />
                        <h3 className="text-xl font-bold mb-2">For Employees</h3>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                            Mark attendance, apply for leaves, view payslips, resolve issues and complete assigned tasks from your personal dashboard.
                        </p>
                        <ul className="space-y-2 mb-8">
                            {['Attendance check-in/out', 'Leave applications', 'Payslip downloads', 'Task progress tracking'].map(item => (
                                <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                                    <CheckCircle2 size={14} className="text-blue-400 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link to="/register" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold rounded-xl transition-all text-sm">
                            Create Account <ArrowRight size={15} />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="border-t border-slate-800 py-10 px-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-primary-600 flex items-center justify-center">
                        <Building2 size={13} className="text-white" />
                    </div>
                    <span className="font-bold text-white text-sm">HRMS Pro</span>
                </div>
                <p className="text-slate-500 text-sm">© 2026 HRMS Pro — Developed by Tanish Kumar</p>
            </footer>
        </div>
    );
};

export default Landing;
