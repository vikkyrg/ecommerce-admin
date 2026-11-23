import React from 'react';
import { User, Bell } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function Topbar({ title, subtitle }) {
  const { admin } = useAdminAuth();

  return (
    <header className="bg-white border-b border-[#e2e3e1] h-16 px-6 sm:px-8 flex items-center justify-between flex-shrink-0">
      <div>
        <h2 className="font-['Manrope'] font-bold text-lg text-black tracking-tight leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="font-['Inter'] text-[11px] text-neutral-500">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 bg-neutral-100/80 px-3 py-1.5 rounded-full border border-neutral-200">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-neutral-800 font-['Inter']">
            Live MongoDB Connected
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-black text-[#ffdf9c] flex items-center justify-center font-bold text-xs font-['Manrope']">
            {admin?.name?.charAt(0) || 'A'}
          </div>
          <span className="text-xs font-bold text-black hidden sm:inline">
            {admin?.name || 'Admin'}
          </span>
        </div>
      </div>
    </header>
  );
}
