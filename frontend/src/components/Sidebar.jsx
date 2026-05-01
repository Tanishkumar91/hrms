import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    CalendarCheck, 
    FileText, 
    CreditCard, 
    Bell,
    LogOut,
    PanelLeftClose,
    PanelLeftOpen,
    Building2,
    ClipboardList
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { user, logout } = useAuth();

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['hr', 'employee'] },
        { name: 'Employees', path: '/employees', icon: Users, roles: ['hr'] },
        { name: 'Attendance', path: '/attendance', icon: CalendarCheck, roles: ['hr', 'employee'] },
        { name: 'Leaves', path: '/leaves', icon: FileText, roles: ['hr', 'employee'] },
        { name: 'Payroll', path: '/payroll', icon: CreditCard, roles: ['hr', 'employee'] },
        { name: 'Issues', path: '/issues', icon: Bell, roles: ['hr', 'employee'] },
        { name: 'Tasks', path: '/tasks', icon: ClipboardList, roles: ['hr', 'employee'] },
    ];

    const filteredItems = menuItems.filter(item => item.roles.includes(user?.role));

    const handleLogout = () => {
        toast.success('Logged out successfully!');
        setTimeout(() => logout(), 500);
    };

    return (
        <aside className={`
            ${isOpen ? 'w-64' : 'w-[72px]'} 
            bg-white dark:bg-slate-800 
            border-r border-slate-200 dark:border-slate-700 
            h-screen sticky top-0 flex flex-col 
            transition-all duration-300 ease-in-out
            z-30 flex-shrink-0 overflow-hidden
        `}>

            {/* ── HEADER ── */}
            <div className="h-16 flex items-center border-b border-slate-100 dark:border-slate-700 px-3 flex-shrink-0">
                {isOpen ? (
                    /* Expanded: logo left, toggle right */
                    <>
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                <Building2 size={16} className="text-white" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-base font-bold text-primary-600 dark:text-primary-400 leading-tight truncate">HRMS Pro</h1>
                                <p className="text-[10px] text-slate-400 leading-tight">Management Portal</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="ml-2 flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            title="Collapse sidebar"
                        >
                            <PanelLeftClose size={18} />
                        </button>
                    </>
                ) : (
                    /* Collapsed: only the toggle icon, perfectly centred */
                    <button
                        onClick={() => setIsOpen(true)}
                        className="w-full flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="Expand sidebar"
                    >
                        <PanelLeftOpen size={20} />
                    </button>
                )}
            </div>

            {/* ── NAV LINKS ── */}
            <nav className="flex-1 px-2.5 space-y-1 py-4 overflow-y-auto overflow-x-hidden">
                {filteredItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center p-2.5 rounded-xl transition-all duration-200 group relative ${
                                isOpen ? 'space-x-3' : 'justify-center'
                            } ${
                                isActive
                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-800 dark:hover:text-white'
                            }`
                        }
                    >
                        <item.icon size={20} className="flex-shrink-0" />
                        {isOpen && <span className="font-medium whitespace-nowrap text-sm">{item.name}</span>}
                        {/* Tooltip when collapsed */}
                        {!isOpen && (
                            <span className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                                {item.name}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* ── FOOTER ── */}
            <div className="border-t border-slate-200 dark:border-slate-700 p-2.5 flex-shrink-0 space-y-1">
                {/* User info — only when expanded */}
                {isOpen && (
                    <div className="flex items-center space-x-2.5 px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-700/40 mb-1">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-sm flex-shrink-0">
                            {user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate leading-tight">{user?.name}</p>
                            <span className="text-[10px] font-bold uppercase tracking-wide text-primary-500">{user?.role}</span>
                        </div>
                    </div>
                )}

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    title={!isOpen ? 'Logout' : undefined}
                    className={`flex items-center w-full p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors group relative ${isOpen ? 'space-x-3' : 'justify-center'}`}
                >
                    <LogOut size={18} className="flex-shrink-0" />
                    {isOpen && <span className="font-medium text-sm">Logout</span>}
                    {!isOpen && (
                        <span className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                            Logout
                        </span>
                    )}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
