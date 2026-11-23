import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';
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
    <div className="min-h-screen bg-[#0f1114] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#181a1f] border border-neutral-800 rounded-2xl p-7 sm:p-9 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-black border border-neutral-800 rounded-xl flex items-center justify-center mx-auto shadow-md">
            <img
              src="/logo.jpeg"
              alt="NS Logo"
              className="w-10 h-10 object-contain rounded"
              onError={e => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <span className="inline-block px-3 py-1 bg-amber-500/10 text-[#ffdf9c] border border-amber-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Restricted Access
          </span>
          <h1 className="font-['Manrope'] font-bold text-2xl text-white tracking-tight">
            NS Stone Chemicals Admin
          </h1>
          <p className="font-['Inter'] text-xs text-neutral-400">
            Sign in with verified administrator credentials to manage products and categories.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-['Inter']">
          <div>
            <label className="block text-neutral-300 font-semibold mb-1.5">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@nsstonechemicals.com"
                className="w-full bg-[#111317] text-white pl-10 pr-3 py-3 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#ffdf9c] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-300 font-semibold mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#111317] text-white pl-10 pr-10 py-3 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#ffdf9c] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ffdf9c] hover:bg-amber-400 text-black font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-60"
            >
              {loading ? 'Authenticating...' : 'Sign In to Control Center'}
            </button>
          </div>
        </form>

        <div className="pt-2 border-t border-neutral-800 text-center">
          <p className="text-[11px] text-neutral-500">
            Default credentials: <strong className="text-neutral-300">admin@nsstonechemicals.com</strong> / <strong className="text-neutral-300">admin123</strong>
          </p>
        </div>

      </div>
    </div>
  );
}
