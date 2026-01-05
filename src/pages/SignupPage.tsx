import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services/auth.service';
import api from '../utils/api';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading, setAuth } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      navigate(`/dashboard/${user.role}`, { replace: true });
    }
  }, [authLoading]); // Only check when auth loading completes

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    setIsLoading(true);
    try {
      const data = await AuthService.register({
        email,
        password,
        password_confirm: confirmPassword,
      });

      setRegisteredEmail(email);
      setShowOtpInput(true);
      toast.success(data.message || 'Registration successful! Please check your email for OTP.');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await AuthService.verifyOTP({
        email: registeredEmail,
        otp,
      });

      if (data?.access_token) {
        // Set token first so subsequent API calls work
        api.setToken(data.access_token);
        // Fetch user info
        const userInfo = await AuthService.getCurrentUser();
        setAuth(data.access_token, userInfo);
        toast.success('Account verified successfully!');
        setTimeout(() => navigate(`/dashboard/${userInfo.role}`), 500);
      }
    } catch (error: any) {
      toast.error(error.message || 'OTP verification failed');
    } finally {
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
          transition={{ duration: 0.3 }}
          className="bg-background rounded-xl p-8 border border-border shadow-lg"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground-default">
              {showOtpInput ? 'Verify Email' : 'Create Account'}
            </h1>
            <p className="text-foreground-muted mt-2">
              {showOtpInput ? 'Enter the OTP sent to your email' : 'Join PrepHub and find your perfect match.'}
            </p>
          </div>
          
          {!showOtpInput ? (
            <form onSubmit={handleSignup} className="space-y-6">
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
                    minLength={8} 
                    required 
                  />
                </div>
                <p className="text-xs text-foreground-muted mt-1">Must contain: numbers, lowercase, uppercase letters (min 8 characters)</p>
              </div>

              <div>
                <label className="form-label">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                  <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    className="form-input pl-10" 
                    placeholder="••••••••" 
                    minLength={8} 
                    required 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground-muted">OTP Code</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                  <input 
                    type="text" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)} 
                    className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                    placeholder="Enter 6-digit OTP" 
                    maxLength={6}
                    required 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Verify & Continue'}
              </button>

              <button 
                type="button" 
                onClick={() => setShowOtpInput(false)} 
                className="w-full py-2 text-foreground-muted hover:text-foreground-default"
              >
                Back to Registration
              </button>
            </form>
          )}

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
