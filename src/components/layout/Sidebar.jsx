import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Tag,
  Package,
  FileSpreadsheet,
  LogOut,
  ExternalLink,
  X
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function Sidebar({ mobileOpen = false, onClose }) {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Categories', path: '/categories', icon: Layers },
    { name: 'Brands', path: '/brands', icon: Tag },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Excel Import', path: '/import', icon: FileSpreadsheet }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container: Fixed slide-over on mobile/tablet, static on lg+ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#141619] text-[#e0e2e6] flex flex-col justify-between border-r border-neutral-800 shadow-2xl transition-transform duration-300 ease-in-out select-none
          lg:static lg:translate-x-0 lg:w-64 lg:shadow-none lg:z-auto
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div>
          <div className="p-4 sm:p-5 border-b border-neutral-800/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-md bg-black border border-neutral-800 flex items-center justify-center flex-shrink-0">
                <img
                  src="/logo.jpeg"
                  alt="NS Stone Logo"
                  className="w-7 h-7 object-contain rounded"
                  onError={e => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <div className="min-w-0">
                <h1 className="font-['Manrope'] font-bold text-sm tracking-tight text-white leading-tight uppercase truncate">
                  NS Stone Chemicals
                </h1>
                <span className="text-[10px] font-mono text-[#ffdf9c] font-semibold uppercase tracking-wider block">
                  Admin Portal
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 sm:p-4 space-y-1.5">
            {navLinks.map(link => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => {
                    if (onClose) onClose();
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-black text-[#ffdf9c] shadow-xs border border-neutral-700/60'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{link.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer / User Profile & Logout */}
        <div className="p-4 border-t border-neutral-800/80 space-y-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-[11px] text-neutral-300 font-medium transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-[#ffdf9c]" />
              <span>Customer Website</span>
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">Live</span>
          </a>

          <div className="pt-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-[#ffdf9c] border border-amber-500/30 flex items-center justify-center font-bold text-xs font-['Manrope'] flex-shrink-0">
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
              className="p-2 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors flex-shrink-0"
              title="Log Out"
              aria-label="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
