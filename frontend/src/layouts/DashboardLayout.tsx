import type { FC } from 'react';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';

export const DashboardLayout: FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col">
      <Header onMenuClick={() => setMobileOpen((value) => !value)} />
      <div className="flex flex-1">
        {mobileOpen && (
          <button
            className="sidebar-backdrop md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          />
        )}
        <Sidebar mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} />
        <main className="flex-1 flex flex-col min-h-0 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
