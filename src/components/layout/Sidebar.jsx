import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Tag,
  Package,
  LogOut,
  ExternalLink,
  X,
  CheckCircle2,
  ChevronDown,
  Mail,
  Users
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function Sidebar({ mobileOpen = false, onClose }) {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navSections = [
    {
      label: 'MAIN MENU',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }
      ]
    },
    {
      label: 'MANAGEMENT',
      items: [
        { name: 'Categories', path: '/categories', icon: Layers },
        { name: 'Brands', path: '/brands', icon: Tag },
        { name: 'Products', path: '/products', icon: Package },
        { name: 'Customers', path: '/customers', icon: Users },
        { name: 'Enquiries', path: '/enquiries', icon: Mail }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 transition-opacity lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[250px] bg-[#FFFFFF] text-[#1E293B] flex flex-col justify-between border-r border-[#E2E8F0] transition-transform duration-200 ease-in-out select-none
          lg:static lg:translate-x-0 lg:w-[250px] lg:z-auto
          ${mobileOpen ? 'translate-x-0 shadow-lg' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Top Half: Header & Nav */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Header */}
          <div className="h-[70px] px-5 border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded border border-[#E2E8F0] bg-white flex items-center justify-center p-0.5 flex-shrink-0">
                <img
                  src="/logo.png"
                  alt="NS Stone Logo"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[16px] font-bold text-[#1E293B] leading-none tracking-tight truncate">
                    NS Stone
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-[#F8F3E9] text-[#B8862D] border border-[#E2D9C8] rounded">
                    PRO
                  </span>
                </div>
                <p className="text-[12px] font-normal text-[#64748B] leading-tight truncate mt-1">
                  Chemicals Catalog
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC]"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
            {navSections.map((section, idx) => (
              <div key={idx}>
                <div className="px-3 pb-2 text-[11px] font-semibold text-[#64748B] tracking-wider uppercase">
                  {section.label}
                </div>
                <div className="space-y-1">
                  {section.items.map(item => {
                    const Icon = item.icon;
                    const isActive =
                      location.pathname === item.path ||
                      (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => {
                          if (onClose) onClose();
                        }}
                        className={`h-[42px] flex items-center gap-3 px-3 rounded-md text-[14.5px] font-medium transition-colors ${isActive
                          ? 'bg-[#F8F3E9] text-[#0F172A] border-l-[3px] border-[#B8862D] rounded-l-none font-semibold'
                          : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC]'
                          }`}
                      >
                        <Icon
                          className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-[#B8862D]' : 'text-[#64748B]'
                            }`}
                        />
                        <span className="truncate">{item.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer Area */}
        <div className="border-t border-[#E2E8F0] p-3.5 space-y-2.5 bg-[#FFFFFF]">
          {/* Customer Store */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="h-[40px] flex items-center justify-between px-3 rounded-md border border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC] transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <ExternalLink className="w-[17px] h-[17px] text-[#64748B] flex-shrink-0" />
              <span className="text-[13.5px] font-medium truncate">Customer Store</span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[12px] font-semibold text-emerald-700">Live</span>
            </div>
          </a>

          {/* Admin Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(prev => !prev)}
              className="w-full flex items-center justify-between p-2 rounded-md hover:bg-[#F8FAFC] transition-colors text-left"
              aria-label="Admin Profile Menu"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-md bg-[#F8F3E9] text-[#B8862D] border border-[#E2D9C8] flex items-center justify-center font-bold text-[13px] flex-shrink-0">
                  {admin?.name?.charAt(0) || 'N'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[13.5px] font-semibold text-[#1E293B] truncate leading-tight tracking-tight">
                      {admin?.name || 'NS Admin'}
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B8862D] flex-shrink-0" />
                  </div>
                  <span className="text-[11.5px] font-normal text-[#64748B] truncate block leading-tight mt-0.5">
                    {admin?.email || 'admin@nsstonechemicals.com'}
                  </span>
                </div>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-[#64748B] flex-shrink-0 transition-transform ${showProfileMenu ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-1.5 bg-white border border-[#E2E8F0] rounded-md shadow-sm py-1 z-20">
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 text-left text-[13px] font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
