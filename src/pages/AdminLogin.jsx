import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@nsstonechemicals.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Invalid administrator email or password.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 text-[#1E293B]">
      <div className="w-full max-w-[400px] bg-white border border-[#E2E8F0] rounded-lg p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-white border border-[#E2E8F0] rounded-md flex items-center justify-center mx-auto p-1">
            <img
              src="/logo.png"
              alt="NS Stone Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="pt-1">
            <h1 className="text-[20px] font-[650] text-[#1E293B]">
              NS Stone Chemicals
            </h1>
            <p className="text-[12px] text-[#64748B] mt-0.5">
              Enterprise Catalog & Inventory Management
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-md flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#1E293B] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@nsstonechemicals.com"
                className="w-full h-[42px] pl-10 pr-3 bg-white text-[#1E293B] text-[14px] placeholder-[#94A3B8] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#1E293B] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-[42px] pl-10 pr-10 bg-white text-[#1E293B] text-[14px] placeholder-[#94A3B8] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#1E293B] cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[42px] bg-[#B8862D] hover:bg-[#9c7126] text-white text-[13px] font-semibold rounded-md transition-colors duration-150 flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>
      </div>
    </div>
  );
}
