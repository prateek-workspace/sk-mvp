import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services/auth.service';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading, setAuth } = useAuth();

  // Only redirect once on initial mount if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate(`/dashboard/${user.role}`, { replace: true });
    }
  }, [authLoading]); // Only check when auth loading completes

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    setIsLoading(true);

    try {
      const data = await AuthService.login(email, password);
      
      console.log('Login response:', data);

      // Update auth context with token and user
      setAuth(data.access_token, data.user);
      
      toast.success('Login successful! Redirecting...');
      
      // Wait a bit for the toast to show and auth to persist
      setTimeout(() => {
        // Redirect based on role
        const role = data.user.role;
        if (role === 'admin') {
          navigate('/dashboard/admin', { replace: true });
        } else if (['hostel', 'coaching', 'library', 'tiffin'].includes(role)) {
          navigate(`/dashboard/${role}`, { replace: true });
        } else {
          navigate('/dashboard/user', { replace: true });
        }
      }, 500);
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid email or password');
      setIsLoading(false);
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
              <label className="form-label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
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
