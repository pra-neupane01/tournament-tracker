import type { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Building2,
  Calendar,
  Gamepad2,
  LayoutDashboard,
  Settings,
  Shield,
  Trophy,
  Users,
} from 'lucide-react';
import { useAuthStore } from '../../features/auth/authStore';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Organizations', path: '/organizations', icon: Building2 },
  { name: 'Games', path: '/games', icon: Gamepad2 },
  { name: 'Tournaments', path: '/tournaments', icon: Trophy },
  { name: 'Teams', path: '/teams', icon: Users },
  { name: 'Matches', path: '/matches', icon: Calendar },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar: FC<{ mobileOpen?: boolean; onNavigate?: () => void }> = ({
  mobileOpen = false,
  onNavigate,
}) => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const visibleItems =
    user?.role === 'SUPER_ADMIN'
      ? [...navItems.slice(0, -1), { name: 'Users', path: '/users', icon: Shield }, navItems.at(-1)!]
      : navItems;

  return (
    <aside
      className={`sidebar-shell ${mobileOpen ? 'flex' : 'hidden'} md:flex`}
    >
      <nav className="flex-1 px-4 py-6 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onNavigate}
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
