/**
 * Main App Component
 * Handles routing and authentication state
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Logs from './pages/Logs';
import Layout from './components/Layout';

function App() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                {/* Public routes */}
                <Route
                    path="/login"
                    element={!session ? <Login /> : <Navigate to="/dashboard" />}
                />
                <Route
                    path="/signup"
                    element={!session ? <Signup /> : <Navigate to="/dashboard" />}
                />

                {/* Protected routes */}
                <Route
                    path="/"
                    element={session ? <Layout /> : <Navigate to="/login" />}
                >
                    <Route index element={<Navigate to="/dashboard" />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="contacts" element={<Contacts />} />
                    <Route path="logs" element={<Logs />} />
                </Route>

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
