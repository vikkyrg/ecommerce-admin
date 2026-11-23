import React from 'react';
import { Menu, Database } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function Topbar({ title, subtitle, onMenuClick }) {
  const { admin } = useAdminAuth();

  return (
    <header className="bg-white border-b border-[#e2e3e1] min-h-16 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 flex-shrink-0 sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-1 text-neutral-700 hover:text-black hover:bg-neutral-100 rounded-xl transition-colors focus:outline-none"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h2 className="font-['Manrope'] font-bold text-base sm:text-lg text-black tracking-tight leading-tight truncate">
            {title}
          </h2>
          {subtitle && (
            <p className="font-['Inter'] text-[11px] text-neutral-500 truncate hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        {/* MongoDB Status Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-neutral-100/80 px-2.5 sm:px-3 py-1.5 rounded-full border border-neutral-200">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
          <span className="text-[11px] sm:text-xs font-semibold text-neutral-800 font-['Inter'] whitespace-nowrap">
            <span className="hidden xs:inline">MongoDB </span>Connected
          </span>
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-black text-[#ffdf9c] flex items-center justify-center font-bold text-xs font-['Manrope'] flex-shrink-0 shadow-2xs">
            {admin?.name?.charAt(0) || 'A'}
          </div>
          <span className="text-xs font-bold text-black hidden md:inline truncate max-w-[120px]">
            {admin?.name || 'Admin'}
          </span>
        </div>
      </div>
    </header>
  );
}
