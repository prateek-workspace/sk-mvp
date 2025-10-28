import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // Redirect if user is logged in and auth is no longer loading
    if (user && !authLoading) {
      navigate(`/dashboard/${user.role}`, { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const promise = supabase.auth.signInWithPassword({
      email,
      password,
    });

    toast.promise(promise, {
      loading: 'Signing in...',
      success: (data) => {
        if (data.error) throw data.error;
        return 'Login successful! Welcome back.';
        // Redirect is handled by AuthContext
      },
      error: (err) => {
        if (err.message === 'Email not confirmed') {
          return 'Email not verified. Please check your inbox.';
        }
        return 'Invalid email or password.';
      },
    });
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative">
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-foreground-muted hover:text-primary transition-colors font-semibold text-sm">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>
      <div className="max-w-md w-full">
         <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background rounded-xl p-8 border border-border shadow-lg"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground-default">Sign In</h1>
            <p className="text-foreground-muted mt-2">Welcome back to PrepHub!</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground-muted">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground-muted">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center disabled:bg-blue-400"
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-sm text-foreground-muted mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
