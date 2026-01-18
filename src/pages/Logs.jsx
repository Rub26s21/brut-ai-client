/**
 * Logs Page
 * View email history and status
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { logsApi } from '../lib/api';
import { Loader, CheckCircle, XCircle, Clock, Mail } from 'lucide-react';

export default function Logs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadLogs();
    }, [filter]);

    const loadLogs = async () => {
        try {
            setLoading(true);
            const params = filter !== 'all' ? { status: filter } : {};
            const data = await logsApi.getAll(supabase, params);
            setLogs(data);
        } catch (error) {
            console.error('Error loading logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'sent':
                return <CheckCircle className="text-green-500" size={20} />;
            case 'failed':
                return <XCircle className="text-red-500" size={20} />;
            case 'pending':
                return <Clock className="text-yellow-500" size={20} />;
            default:
                return <Mail className="text-gray-500" size={20} />;
        }
    };

    const getStatusBadge = (status) => {
        const classes = {
            sent: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
            failed: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
            pending: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${classes[status]}`}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Email Logs
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        View all sent birthday wishes
                    </p>
                </div>

                {/* Filter */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'all'
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('sent')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'sent'
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        Sent
                    </button>
                    <button
                        onClick={() => setFilter('failed')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'failed'
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        Failed
                    </button>
                </div>
            </div>

            {/* Logs List */}
            <div className="space-y-4">
                {logs.length === 0 ? (
                    <div className="card text-center py-12">
                        <Mail className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-600 dark:text-gray-400">
                            No email logs found
                        </p>
                    </div>
                ) : (
                    logs.map((log) => (
                        <div key={log.id} className="card hover:shadow-xl transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="mt-1">{getStatusIcon(log.status)}</div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                {log.contact_name}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {log.contact_email}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            {getStatusBadge(log.status)}
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(log.sent_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {log.message_content && (
                                        <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                                {log.message_content}
                                            </p>
                                        </div>
                                    )}

                                    {log.error_message && (
                                        <div className="mt-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                <strong>Error:</strong> {log.error_message}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
