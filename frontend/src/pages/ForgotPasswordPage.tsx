import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Mail, Lock, ArrowLeft, KeyRound, RefreshCw } from 'lucide-react';
import { AuthService } from '../services/auth.service';

type Step = 'email' | 'otp' | 'password';

const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await AuthService.forgotPassword(email);
      toast.success(response.message || 'OTP sent to your email!');
      setStep('otp');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP. Please check your email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length < 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    // Move to password step - OTP will be verified when setting new password
    setStep('password');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await AuthService.resetPassword({
        email,
        otp,
        password,
        password_confirm: confirmPassword,
      });
      
      toast.success(response.message || 'Password reset successfully!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    
    try {
      await AuthService.resendOTPWithType({
        request_type: 'reset-password',
        email,
      });
      toast.success('New OTP sent to your email!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'email':
        return 'Forgot Password';
      case 'otp':
        return 'Verify OTP';
      case 'password':
        return 'Reset Password';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'email':
        return 'Enter your email address and we\'ll send you an OTP to reset your password.';
      case 'otp':
        return `Enter the 6-digit OTP sent to ${email}`;
      case 'password':
        return 'Create a new password for your account.';
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative">
      <Link 
        to="/login" 
        className="absolute top-6 left-6 flex items-center gap-2 text-foreground-muted hover:text-primary transition-colors font-semibold text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Login</span>
      </Link>
      
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-background rounded-xl p-8 border border-border shadow-lg"
        >
          {/* Progress Indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step === 'email' ? 'bg-primary text-white' : 'bg-green-500 text-white'
              }`}>
                1
              </div>
              <div className={`w-8 h-1 rounded ${
                step !== 'email' ? 'bg-green-500' : 'bg-border'
              }`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step === 'otp' ? 'bg-primary text-white' : 
                step === 'password' ? 'bg-green-500 text-white' : 'bg-border text-foreground-muted'
              }`}>
                2
              </div>
              <div className={`w-8 h-1 rounded ${
                step === 'password' ? 'bg-green-500' : 'bg-border'
              }`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step === 'password' ? 'bg-primary text-white' : 'bg-border text-foreground-muted'
              }`}>
                3
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground-default">{getStepTitle()}</h1>
            <p className="text-foreground-muted mt-2">{getStepDescription()}</p>
          </div>
          
          {step === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="form-label">Email Address</label>
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-rose-600 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30"
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label className="form-label">OTP Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="form-input pl-10 text-center tracking-widest text-lg"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>
                <p className="text-xs text-foreground-muted mt-1">OTP expires in 5 minutes</p>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length < 6}
                className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-rose-600 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30"
              >
                Verify OTP
              </button>

              <div className="flex items-center justify-between">
                <button 
                  type="button" 
                  onClick={() => setStep('email')} 
                  className="text-sm text-foreground-muted hover:text-foreground-default"
                >
                  Change Email
                </button>
                <button 
                  type="button" 
                  onClick={handleResendOTP}
                  disabled={isResending}
                  className="text-sm text-primary hover:underline flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                  {isResending ? 'Resending...' : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="form-label">New Password</label>
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
                <p className="text-xs text-foreground-muted mt-1">
                  Must contain: numbers, lowercase, uppercase letters (min 8 characters)
                </p>
              </div>

              <div>
                <label className="form-label">Confirm New Password</label>
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
                className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-rose-600 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30"
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </button>

              <button 
                type="button" 
                onClick={() => setStep('otp')} 
                className="w-full py-2 text-foreground-muted hover:text-foreground-default"
              >
                Back to OTP
              </button>
            </form>
          )}

          <p className="text-center text-sm text-foreground-muted mt-8">
            Remember your password?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
