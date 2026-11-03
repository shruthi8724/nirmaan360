import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (path: string) => {
    if (path === '/') return 'Construction Risk Dashboard';
    if (path.startsWith('/projects/')) return 'Project Intelligence & Details';
    if (path.startsWith('/projects')) return 'Project Portfolio Management';
    if (path.startsWith('/materials')) return 'Material Supply Chain Tracker';
    if (path.startsWith('/resources')) return 'Resource Allocation & Utilization';
    if (path.startsWith('/risk-intelligence')) return 'Risk Intelligence Engine';
    if (path.startsWith('/analytics')) return 'Construction Portfolio Analytics';
    if (path.startsWith('/settings')) return 'Platform Settings & Config';
    return 'Nirman360';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Navigation Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header setMobileOpen={setMobileOpen} title={getPageTitle(location.pathname)} />
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
