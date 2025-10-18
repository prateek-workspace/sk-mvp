import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { mockUsers } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      login(user);
      navigate(`/dashboard/${user.role}`);
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  const quickLogin = (userEmail: string) => {
    const user = mockUsers.find((u) => u.email === userEmail);
    if (user) {
      login(user);
      navigate(`/dashboard/${user.role}`);
    }
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

            {error && (
              <p className="text-red-500 text-sm bg-red-100 dark:bg-red-900/40 dark:text-red-400 px-4 py-2 rounded-lg text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          </form>

          <div className="mt-8 border-t border-border pt-6">
            <h3 className="text-sm font-medium mb-4 text-center text-foreground-muted">
              Or use a demo account
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {mockUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => quickLogin(user.email)}
                  className="px-3 py-2 bg-surface border border-border rounded-lg text-center hover:border-primary transition-colors"
                >
                  <p className="font-semibold capitalize text-sm">{user.role}</p>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
