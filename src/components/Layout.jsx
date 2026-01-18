/**
 * Layout Component
 * Main layout with sidebar navigation
 */

import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    LayoutDashboard,
    Users,
    FileText,
    LogOut,
    Moon,
    Sun,
    Menu,
    X
} from 'lucide-react';

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [darkMode, setDarkMode] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Get user info
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });

        // Check for dark mode preference
        const isDark = localStorage.getItem('darkMode') === 'true';
        setDarkMode(isDark);
        if (isDark) {
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('darkMode', newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/contacts', icon: Users, label: 'Contacts' },
        { path: '/logs', icon: FileText, label: 'Email Logs' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Mobile menu button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
            >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            BRUT AI
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {user?.email}
                        </p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => {
                                        navigate(item.path);
                                        setSidebarOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                        <button
                            onClick={toggleDarkMode}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                            <span className="font-medium">
                                {darkMode ? 'Light Mode' : 'Dark Mode'}
                            </span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                        >
                            <LogOut size={20} />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="lg:ml-64 min-h-screen">
                <div className="p-4 lg:p-8">
                    <Outlet />
                </div>
            </main>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}
