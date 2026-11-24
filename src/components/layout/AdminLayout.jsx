import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FA] text-[#111827]">
      {/* Responsive Sidebar & Mobile Slide-in Drawer */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Outlet context={{ toggleMobileMenu: () => setMobileMenuOpen(prev => !prev) }} />
      </div>
    </div>
  );
}
