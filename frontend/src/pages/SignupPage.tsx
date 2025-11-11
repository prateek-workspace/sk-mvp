import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Mail, Lock, User as UserIcon, Briefcase, ArrowLeft } from 'lucide-react';
import api from '../utils/api';
import { UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

const SignupPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (user && !authLoading) {
      navigate(`/dashboard/${user.role}`, { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    // Call backend register endpoint
    const promise = api.post('/auth/register', {
      name: fullName,
      email,
      password,
      role,
    });

    toast.promise(promise, {
      loading: 'Creating your account...',
      success: (data) => {
        if (!data?.access_token) throw new Error('Invalid response from server');
        // Store token and user, then redirect to dashboard
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        api.setToken(data.access_token);
        setTimeout(() => navigate(`/dashboard/${data.user.role}`), 500);
        return 'Account created! Redirecting...';
      },
      error: (err: any) => err.message || 'An unexpected error occurred.',
    });
  };

  const roles: { value: UserRole; label: string }[] = [
    { value: 'student', label: 'Student' },
    { value: 'coaching', label: 'Coaching Owner' },
    { value: 'library', label: 'Library Owner' },
    { value: 'pg', label: 'Hostel/PG Owner' },
    { value: 'tiffin', label: 'Tiffin Service Owner' },
  ];

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
          transition={{ duration: 0.3 }}
          className="bg-background rounded-xl p-8 border border-border shadow-lg"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground-default">Create Account</h1>
            <p className="text-foreground-muted mt-2">Join PrepHub and find your perfect match.</p>
          </div>
          
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground-muted">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="John Doe" required />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground-muted">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="you@example.com" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground-muted">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="••••••••" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground-muted">I am a...</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary">
                  {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center disabled:bg-blue-400">
              Sign Up
            </button>
          </form>

          <p className="text-center text-sm text-foreground-muted mt-8">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;
