import React, { useState, useEffect } from 'react';
import { Search, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
    const { user } = useAuth();
    return (
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 sticky top-0 z-10 flex items-center justify-between px-8">
            <div className="flex-1"></div>

            <div className="flex items-center space-y-0 space-x-6">
                <NotificationDropdown />
                <div className="flex items-center space-x-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                        <span className={`inline-block px-2 py-0.5 mt-0.5 rounded-full text-[10px] font-bold uppercase ${user?.role === 'hr' ? 'bg-blue-100 text-blue-600' : 
                            'bg-green-100 text-green-600'
                        }`}>
                            {user?.role}
                        </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 border border-primary-200 dark:border-primary-800">
                        <UserIcon size={20} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
