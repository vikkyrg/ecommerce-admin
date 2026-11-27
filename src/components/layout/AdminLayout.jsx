import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const desktopViewport = window.matchMedia('(min-width: 1024px)');
    const closeDrawerOnDesktop = event => {
      if (event.matches) setMobileMenuOpen(false);
    };

    desktopViewport.addEventListener('change', closeDrawerOnDesktop);
    return () => desktopViewport.removeEventListener('change', closeDrawerOnDesktop);
  }, []);

  return (
    <div className="flex h-[100dvh] min-h-0 overflow-hidden bg-[#F8F9FA] text-[#111827]">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className={`flex min-h-0 min-w-0 flex-1 flex-col overscroll-y-contain ${
        mobileMenuOpen ? 'overflow-y-hidden' : 'overflow-y-auto'
      }`}>
        <Outlet context={{ toggleMobileMenu: () => setMobileMenuOpen(prev => !prev) }} />
      </div>
    </div>
  );
}
