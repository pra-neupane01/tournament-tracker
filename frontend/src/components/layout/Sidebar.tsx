import type { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Trophy, Users, Calendar, Settings } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Tournaments', path: '/tournaments', icon: Trophy },
  { name: 'Teams', path: '/teams', icon: Users },
  { name: 'Matches', path: '/matches', icon: Calendar },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar: FC = () => {
  const location = useLocation();

  return (
    <aside className="w-64 border-r border-[var(--color-border)] bg-[var(--color-surface)] hidden md:flex flex-col h-[calc(100vh-4rem)] sticky top-16">
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
                isActive 
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' 
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-main)]'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-[var(--color-border)]">
        <div className="text-xs text-[var(--color-text-muted)] text-center">
          EsportsManager v1.0
        </div>
      </div>
    </aside>
  );
};
