import type { FC } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';

export const DashboardLayout: FC = () => {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 flex flex-col min-h-0 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
