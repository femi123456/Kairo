import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Mail } from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'reset'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    const token = searchParams.get('token');
    const isResetPath = location.pathname === '/reset-password';
    
    if (token || isResetPath) {
      setMode('reset');
      if (token) setResetToken(token);
    } else if (searchParams.get('mode') === 'signup') {
      setMode('signup');
    }
  }, [searchParams, location.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'signin' || mode === 'signup') {
        const endpoint = mode === 'signin' ? '/auth/login' : '/auth/register';
        const payload = mode === 'signin' ? { email, password } : { name, email, password };
        
        const response = await api.post(endpoint, payload);
        const { token, user } = response.data;
        
        login(token, user);
        navigate('/app');
      } else if (mode === 'forgot') {
        await api.post('/auth/forgot-password', { email });
        setForgotSuccess(true);
      } else if (mode === 'reset') {
        if (password !== confirmPassword) {
          toast.error('Passwords do not match');
          setIsLoading(false);
          return;
        }
        const response = await api.post('/auth/reset-password', { token: resetToken, password });
        const { token, user } = response.data;
        login(token, user);
        navigate('/app');
        toast.success('Password reset successfully');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Authentication failed. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0A0A0A] flex items-center justify-center font-['Inter']">
      {/* Background Radial Gradient */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255,107,0,0.06) 0%, transparent 70%)'
        }}
      />
      
      {/* Card */}
      <div className="relative w-full max-w-[400px] bg-[#111111] border border-[#2A2A2A] rounded-2xl p-[32px_20px] md:p-10 mx-4 md:shadow-2xl">
        
        {mode === 'forgot' && (
          <button 
            onClick={() => { setMode('signin'); setForgotSuccess(false); }}
            className="absolute top-6 left-6 text-[#888888] hover:text-[#F0F0F0] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        {/* Logo or alternative Header */}
        {mode === 'forgot' && forgotSuccess ? (
          <div className="flex flex-col items-center text-center">
            <Mail size={40} color="#FF6B00" className="mb-4" />
            <h2 className="text-white text-[20px] font-semibold mb-2">Check your email</h2>
            <p className="text-[#888888] text-[14px] mb-6">
              We sent a password reset link to {email}
            </p>
            <button 
              onClick={() => { setMode('signin'); setForgotSuccess(false); }}
              className="text-[#888888] text-[13px] hover:text-[#FF6B00] transition-colors hover:underline"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center mb-8">
              {mode === 'forgot' ? (
                <>
                  <h2 className="text-white text-[20px] font-semibold mb-2">Forgot password</h2>
                  <p className="text-[#888888] text-[14px]">Enter your email and we'll send you a reset link</p>
                </>
              ) : mode === 'reset' ? (
                <>
                  <h2 className="text-white text-[20px] font-semibold mb-2">Choose a new password</h2>
                  <p className="text-[#888888] text-[14px]">Enter your new password below</p>
                </>
              ) : (
                <>
                  <div className="font-['Georgia'] text-[26px] mb-2 leading-none">
                    <span className="text-white font-bold">Kai</span>
                    <span className="text-[#FF6B00] font-bold">ro</span>
                  </div>
                  <p className="text-[#888888] text-[14px]">Your collaborative workspace</p>
                </>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {mode === 'signup' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#888888]">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg p-[11px_14px] text-[#F0F0F0] text-[14px] focus:border-[#FF6B00] focus:outline-none focus:ring-[3px] focus:ring-[rgba(255,107,0,0.15)] transition-all"
                    placeholder="Jane Doe"
                  />
                </div>
              )}

              {(mode === 'signin' || mode === 'signup' || mode === 'forgot') && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#888888]">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg p-[11px_14px] text-[#F0F0F0] text-[14px] focus:border-[#FF6B00] focus:outline-none focus:ring-[3px] focus:ring-[rgba(255,107,0,0.15)] transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              )}

              {(mode === 'signin' || mode === 'signup' || mode === 'reset') && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#888888]">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg p-[11px_14px] text-[#F0F0F0] text-[14px] focus:border-[#FF6B00] focus:outline-none focus:ring-[3px] focus:ring-[rgba(255,107,0,0.15)] transition-all"
                    placeholder="••••••••"
                  />
                  {mode === 'signin' && (
                    <span 
                      onClick={() => { setMode('forgot'); setForgotSuccess(false); }}
                      className="text-[12px] text-[#888888] hover:text-[#FF6B00] cursor-pointer self-end mt-1 transition-colors"
                    >
                      Forgot password?
                    </span>
                  )}
                </div>
              )}

              {mode === 'reset' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#888888]">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg p-[11px_14px] text-[#F0F0F0] text-[14px] focus:border-[#FF6B00] focus:outline-none focus:ring-[3px] focus:ring-[rgba(255,107,0,0.15)] transition-all"
                    placeholder="••••••••"
                  />
                  {password !== confirmPassword && confirmPassword.length > 0 && (
                    <span className="text-[12px] text-red-500 mt-1">Passwords do not match</span>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full bg-[#FF6B00] text-white rounded-lg p-[12px] text-[15px] font-medium hover:bg-[#FF8C2A] transition-[background-color] duration-150 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : mode === 'signin' ? (
                  'Sign In'
                ) : mode === 'signup' ? (
                  'Sign Up'
                ) : mode === 'forgot' ? (
                  'Send reset link'
                ) : (
                  'Reset password'
                )}
              </button>
            </form>

            {/* Toggle */}
            {(mode === 'signin' || mode === 'signup') && (
              <div className="mt-6 text-center text-[13px] text-[#888888]">
                {mode === 'signin' ? (
                  <p>
                    Don't have an account?{' '}
                    <span 
                      onClick={() => setMode('signup')}
                      className="text-[#FF6B00] cursor-pointer hover:underline"
                    >
                      Sign up
                    </span>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <span 
                      onClick={() => setMode('signin')}
                      className="text-[#FF6B00] cursor-pointer hover:underline"
                    >
                      Sign in
                    </span>
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
