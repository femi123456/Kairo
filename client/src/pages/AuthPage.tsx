import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  
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

  const getHeadline = () => {
    if (mode === 'signin') return 'Welcome Back!';
    if (mode === 'signup') return 'Create Account';
    if (mode === 'forgot') return forgotSuccess ? 'Check your email' : 'Forgot Password';
    return 'Reset Password';
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050505] flex flex-col items-center justify-center font-['Inter'] overflow-hidden">
      
      {/* Background Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />

      {/* Back button for Forgot/Reset */}
      {(mode === 'forgot' || mode === 'reset') && !forgotSuccess && (
        <button 
          onClick={() => { setMode('signin'); setForgotSuccess(false); }}
          className="absolute top-8 left-8 text-[#888] hover:text-white transition-colors z-50 flex items-center gap-2"
        >
          <ArrowLeft size={20} /> Back
        </button>
      )}

      {/* Top Left Logo (Optional, mimicking navbar placement without the navbar) */}
      <Link to="/" className="absolute top-8 left-8 z-50 font-['Georgia'] text-[24px] leading-none tracking-tight">
        <span className="text-white font-bold">Kai</span>
        <span className="text-[#FF6B00] font-bold">ro</span>
      </Link>

      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center px-4">
        
        {/* Pill Badge */}
        {!forgotSuccess && (
          <div className="border border-white/20 rounded-full px-4 py-1.5 text-[12px] font-medium text-white/80 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-white rounded-full opacity-70" /> 
            {mode === 'signin' ? 'Login' : mode === 'signup' ? 'Register' : 'Recovery'}
          </div>
        )}

        {/* Headline */}
        <h1 className="text-[42px] md:text-[56px] font-bold text-white mb-10 tracking-tight text-center leading-tight">
          {getHeadline()}
        </h1>

        {forgotSuccess ? (
          <div className="flex flex-col items-center text-center">
            <p className="text-[#888888] text-[16px] mb-8">
              We sent a password reset link to <span className="text-white">{email}</span>
            </p>
            <button 
              onClick={() => { setMode('signin'); setForgotSuccess(false); }}
              className="text-[#FF6B00] text-[15px] font-medium hover:text-[#FF8C2A] transition-colors"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-4">
            
            {mode === 'signup' && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#1A1A1A] rounded-full px-6 py-4 text-white text-[15px] placeholder:text-[#666] focus:outline-none focus:bg-[#222] transition-colors"
                placeholder="Full Name"
              />
            )}

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#1A1A1A] rounded-full px-6 py-4 text-white text-[15px] placeholder:text-[#666] focus:outline-none focus:bg-[#222] transition-colors"
              placeholder="Email"
            />

            {(mode === 'signin' || mode === 'signup' || mode === 'reset') && (
              <div className="relative w-full">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#1A1A1A] rounded-full pl-6 pr-14 py-4 text-white text-[15px] placeholder:text-[#666] focus:outline-none focus:bg-[#222] transition-colors"
                  placeholder="Password"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[#666] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}

            {mode === 'reset' && (
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-[#1A1A1A] rounded-full px-6 py-4 text-white text-[15px] placeholder:text-[#666] focus:outline-none focus:bg-[#222] transition-colors"
                placeholder="Confirm Password"
              />
            )}

            {mode === 'signin' && (
              <span 
                onClick={() => { setMode('forgot'); setForgotSuccess(false); }}
                className="text-[#FF6B00] text-[13px] mt-2 cursor-pointer hover:text-[#FF8C2A] transition-colors"
              >
                Forgot Password?
              </span>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 bg-[#2A1608] border border-[#FF6B00]/20 rounded-full pr-8 pl-2.5 py-2.5 flex items-center gap-4 hover:bg-[#3A1E0B] hover:border-[#FF6B00]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <div className="w-9 h-9 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#FF6B00] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ArrowRight size={18} className="text-white" />
                </div>
              )}
              <span className="text-white text-[15px] font-medium pr-2">
                {mode === 'signin' ? 'Login' : mode === 'signup' ? 'Register' : mode === 'forgot' ? 'Send Link' : 'Reset'}
              </span>
            </button>
          </form>
        )}

        {/* Footer Toggle */}
        {!forgotSuccess && (mode === 'signin' || mode === 'signup') && (
          <div className="mt-12 text-[14px] text-white font-medium">
            {mode === 'signin' ? 'No account? ' : 'Already have an account? '}
            <button 
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-[#FF6B00] hover:text-[#FF8C2A] transition-colors"
            >
              {mode === 'signin' ? 'Register' : 'Login'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default AuthPage;
