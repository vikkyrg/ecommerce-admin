import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import api from '../../services/apiClient';

export default function Topbar({ title, subtitle, onMenuClick }) {
  const { admin } = useAdminAuth();
  const [serverStatus, setServerStatus] = useState('checking'); // 'connected' | 'offline' | 'checking'

  useEffect(() => {
    let isMounted = true;
    const checkHealth = async () => {
      try {
        const { data } = await api.get('/health');
        if (isMounted) {
          setServerStatus(data.database === 'connected' ? 'connected' : 'local-ready');
        }
      } catch {
        if (isMounted) setServerStatus('offline');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="bg-white border-b border-[#E2E8F0] min-h-[70px] px-5 sm:px-8 py-3.5 flex items-center justify-between gap-4 flex-shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Mobile Hamburger */}
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-1 text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC] rounded-md transition-colors focus:outline-none"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-[26px] font-bold text-[#1E293B] leading-tight tracking-[-0.025em] truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[14px] text-[#64748B] font-normal leading-normal tracking-[-0.01em] truncate hidden sm:block mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3.5 sm:gap-4 flex-shrink-0">
        {/* Backend Status Badge */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-md border text-[12px] font-medium tracking-tight ${
          serverStatus === 'connected'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : serverStatus === 'local-ready'
            ? 'bg-amber-50 border-amber-200 text-amber-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
            serverStatus === 'connected'
              ? 'bg-emerald-500'
              : serverStatus === 'local-ready'
              ? 'bg-amber-500'
              : 'bg-red-500'
            }`} />
          <span className="whitespace-nowrap">
            {serverStatus === 'connected'
              ? 'Backend Live'
              : serverStatus === 'local-ready'
              ? 'Local Mode'
              : 'Offline'}
          </span>
        </div>

        {/* User Mini Avatar & Name */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-[#E2E8F0]">
          <div className="w-8 h-8 rounded-md bg-[#F8F3E9] text-[#B8862D] border border-[#E2D9C8] flex items-center justify-center font-bold text-[13px] flex-shrink-0">
            {admin?.name?.charAt(0) || 'A'}
          </div>
          <span className="text-[14px] font-semibold text-[#1E293B] hidden md:inline truncate max-w-[140px] tracking-tight">
            {admin?.name || 'Administrator'}
          </span>
        </div>
      </div>
    </header>
  );
}
