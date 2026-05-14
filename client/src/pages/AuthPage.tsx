import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setName('');
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin ? { email, password } : { name, email, password };
      
      const response = await api.post(endpoint, payload);
      const { token, user } = response.data;
      
      login(token, user);
      navigate('/app');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
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
      <div className="relative w-full max-w-[400px] bg-[#111111] border border-[#2A2A2A] rounded-2xl p-10 mx-4 shadow-2xl">
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="font-['Georgia'] text-[26px] mb-2 leading-none">
            <span className="text-white font-bold">Kai</span>
            <span className="text-[#FF6B00] font-bold">ro</span>
          </div>
          <p className="text-[#888888] text-[14px]">Your collaborative workspace</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-[10px_14px] bg-[rgba(255,59,48,0.1)] border border-[rgba(255,59,48,0.3)] rounded-lg text-[#FF3B30] text-[13px] text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#888888]">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
                className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg p-[11px_14px] text-[#F0F0F0] text-[14px] focus:border-[#FF6B00] focus:outline-none focus:ring-[3px] focus:ring-[rgba(255,107,0,0.15)] transition-all"
                placeholder="Jane Doe"
              />
            </div>
          )}

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
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full bg-[#FF6B00] text-white rounded-lg p-[12px] text-[15px] font-medium hover:bg-[#FF8C2A] transition-[background-color] duration-150 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              isLogin ? 'Sign In' : 'Sign Up'
            )}
          </button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center text-[13px] text-[#888888]">
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <span 
                onClick={toggleMode}
                className="text-[#FF6B00] cursor-pointer hover:underline"
              >
                Sign up
              </span>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <span 
                onClick={toggleMode}
                className="text-[#FF6B00] cursor-pointer hover:underline"
              >
                Sign in
              </span>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
