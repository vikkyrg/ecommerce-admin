import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Package,
  LogOut,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function Sidebar() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Categories', path: '/categories', icon: Layers },
    { name: 'Products', path: '/products', icon: Package }
  ];

  return (
    <aside className="w-64 bg-[#141619] text-[#e0e2e6] flex flex-col justify-between border-r border-neutral-800 flex-shrink-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-neutral-800/80 flex items-center gap-3">
          <img
            src="/logo.jpeg"
            alt="NS Stone Logo"
            className="w-9 h-9 object-contain rounded-md"
            onError={e => {
              e.target.style.display = 'none';
            }}
          />
          <div>
            <h1 className="font-['Manrope'] font-bold text-sm tracking-tight text-white leading-tight uppercase">
              NS Stone Chemicals
            </h1>
            <span className="text-[10px] font-mono text-[#ffdf9c] font-semibold uppercase tracking-wider block">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navLinks.map(link => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-black text-[#ffdf9c] shadow-xs border border-neutral-700/60'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile & Logout */}
      <div className="p-4 border-t border-neutral-800/80 space-y-3">
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-[11px] text-neutral-300 font-medium transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5 text-[#ffdf9c]" />
            <span>Customer Website</span>
          </span>
          <span className="text-[10px] text-neutral-500">:5173</span>
        </a>

        <div className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-[#ffdf9c] border border-amber-500/30 flex items-center justify-center font-bold text-xs font-['Manrope']">
              {admin?.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-bold text-white truncate leading-tight">
                {admin?.name || 'Administrator'}
              </span>
              <span className="text-[10px] text-neutral-400 truncate block">
                {admin?.email || 'admin@nsstonechemicals.com'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
