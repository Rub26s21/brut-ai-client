/**
 * Signup Page
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Loader, Building } from 'lucide-react';

export default function Signup() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Sign up the user
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            // Update profile with business name
            if (data.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({ business_name: businessName })
                    .eq('id', data.user.id);

                if (profileError) console.error('Profile update error:', profileError);
            }

            navigate('/dashboard');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🎉</div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Get Started
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Create your account and start sending birthday wishes
                    </p>
                </div>

                {/* Signup Form */}
                <div className="card">
                    <form onSubmit={handleSignup} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-2">Business Name</label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="Your Business"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Must be at least 6 characters
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader className="animate-spin" size={20} />
                                    Creating account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600 dark:text-gray-400">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 dark:text-gray-500 mt-8">
                    By signing up, you agree to our Terms of Service
                </p>
            </div>
        </div>
    );
}
