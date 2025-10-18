import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Mail, Lock } from 'lucide-react';
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mb-6">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Welcome to Student Prep Hub</h1>
          <p className="text-foreground-muted">
            Your one-stop platform for all student needs. Log in to manage your services or find the best options for your prep journey.
          </p>
          <div className="mt-8 border-t border-border pt-6">
            <h3 className="text-sm font-medium mb-4 text-foreground-muted">
              Quick Login (Demo Accounts)
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {mockUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => quickLogin(user.email)}
                  className="px-4 py-2 bg-surface border border-border rounded-lg text-left hover:border-primary transition-colors"
                >
                  <p className="font-medium capitalize text-sm">{user.role}</p>
                  <p className="text-xs text-foreground-muted">{user.email}</p>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-xl p-8 border border-border"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground-muted">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Sign In
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
