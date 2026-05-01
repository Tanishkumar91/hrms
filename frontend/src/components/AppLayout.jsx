import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AppLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#1e293b',
                        color: '#f1f5f9',
                        borderRadius: '12px',
                        border: '1px solid #334155',
                        fontSize: '14px',
                        fontWeight: '500',
                        padding: '12px 16px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                    },
                    success: {
                        iconTheme: { primary: '#22c55e', secondary: '#1e293b' },
                    },
                    error: {
                        iconTheme: { primary: '#ef4444', secondary: '#1e293b' },
                    },
                }}
            />
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <div className="flex-1 flex flex-col min-w-0">
                <Navbar />
                <main className="p-8 flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
