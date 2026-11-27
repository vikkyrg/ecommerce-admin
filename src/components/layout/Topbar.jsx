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
    <header className="sticky top-0 z-30 flex min-h-[64px] flex-shrink-0 items-center justify-between gap-2 border-b border-[#E2E8F0] bg-white px-3 py-3 sm:min-h-[70px] sm:gap-4 sm:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3.5">
        {/* Mobile Hamburger */}
        <button
          type="button"
          onClick={onMenuClick}
          className="-ml-1 inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#1E293B] focus:outline-none lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-[19px] font-bold leading-tight tracking-[-0.025em] text-[#1E293B] sm:text-[22px] lg:text-[26px]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 hidden truncate text-[14px] font-normal leading-normal tracking-[-0.01em] text-[#64748B] sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2 sm:gap-4">
        {/* Backend Status Badge */}
        <div
          aria-label={`Backend status: ${serverStatus === 'connected' ? 'live' : serverStatus === 'local-ready' ? 'local mode' : 'offline'}`}
          className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium tracking-tight sm:gap-2 sm:px-3 sm:text-[12px] ${
          serverStatus === 'connected'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : serverStatus === 'local-ready'
            ? 'bg-amber-50 border-amber-200 text-amber-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <span className={`h-2 w-2 flex-shrink-0 rounded-full ${
            serverStatus === 'connected'
              ? 'bg-emerald-500'
              : serverStatus === 'local-ready'
              ? 'bg-amber-500'
              : 'bg-red-500'
            }`} />
          <span className="topbar-status-label whitespace-nowrap">
            {serverStatus === 'connected'
              ? 'Backend Live'
              : serverStatus === 'local-ready'
              ? 'Local Mode'
              : 'Offline'}
          </span>
        </div>

        {/* User Mini Avatar & Name */}
        <div className="flex items-center gap-2 border-l border-[#E2E8F0] pl-2 sm:gap-2.5 sm:pl-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-[#E2D9C8] bg-[#F8F3E9] text-[13px] font-bold text-[#B8862D]">
            {admin?.name?.charAt(0) || 'A'}
          </div>
          <span className="hidden max-w-[140px] truncate text-[14px] font-semibold tracking-tight text-[#1E293B] md:inline">
            {admin?.name || 'Administrator'}
          </span>
        </div>
      </div>
    </header>
  );
}
