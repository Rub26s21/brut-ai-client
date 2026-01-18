/**
 * Dashboard Page
 * Shows statistics and upcoming birthdays
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { contactsApi, logsApi } from '../lib/api';
import { Calendar, Mail, TrendingUp, Cake, Loader } from 'lucide-react';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Load stats
            const statsData = await logsApi.getStats(supabase);
            setStats(statsData);

            // Load all contacts to find upcoming birthdays
            const contacts = await contactsApi.getAll(supabase);

            // Find upcoming birthdays (next 30 days)
            const today = new Date();
            const upcoming = contacts
                .map(contact => {
                    const dob = new Date(contact.dob);
                    const thisYear = today.getFullYear();
                    const nextBirthday = new Date(thisYear, dob.getMonth(), dob.getDate());

                    // If birthday already passed this year, use next year
                    if (nextBirthday < today) {
                        nextBirthday.setFullYear(thisYear + 1);
                    }

                    const daysUntil = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));

                    return {
                        ...contact,
                        nextBirthday,
                        daysUntil,
                    };
                })
                .filter(c => c.daysUntil <= 30)
                .sort((a, b) => a.daysUntil - b.daysUntil)
                .slice(0, 5);

            setUpcomingBirthdays(upcoming);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Welcome back! Here's your birthday wishes overview.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    icon={Mail}
                    label="Total Sent"
                    value={stats?.totalSent || 0}
                    color="blue"
                />
                <StatCard
                    icon={TrendingUp}
                    label="This Month"
                    value={stats?.thisMonth || 0}
                    color="green"
                />
                <StatCard
                    icon={Calendar}
                    label="Failed"
                    value={stats?.totalFailed || 0}
                    color="red"
                />
            </div>

            {/* Upcoming Birthdays */}
            <div className="card">
                <div className="flex items-center gap-3 mb-6">
                    <Cake className="text-purple-600" size={24} />
                    <h2 className="text-xl font-bold">Upcoming Birthdays</h2>
                </div>

                {upcomingBirthdays.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-600 dark:text-gray-400">
                            No upcoming birthdays in the next 30 days
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {upcomingBirthdays.map((contact) => (
                            <div
                                key={contact.id}
                                className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800"
                            >
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        {contact.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {contact.email}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {contact.daysUntil}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                        {contact.daysUntil === 0 ? 'Today!' : contact.daysUntil === 1 ? 'day' : 'days'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }) {
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        red: 'from-red-500 to-red-600',
        purple: 'from-purple-500 to-purple-600',
    };

    return (
        <div className="card">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                </div>
                <div className={`p-4 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg`}>
                    <Icon size={28} />
                </div>
            </div>
        </div>
    );
}
