import { LogOut, Menu, User } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/authStore';
import { NotificationCenter } from '../notifications/NotificationCenter';

export function PlayerHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const signOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="player-navbar">
      <div className="flex items-center gap-6">
        <button
          className="icon-button md:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5 text-white" />
        </button>
        <Link to="/" className="font-bold text-xl text-white tracking-tight flex items-center gap-2">
          <span className="text-[var(--color-primary)]">Esports</span>Manager
        </Link>

        <nav className="player-nav-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Home
          </NavLink>
          <NavLink to="/games" className={({ isActive }) => (isActive ? 'active' : '')}>
            Games
          </NavLink>
          <NavLink to="/teams" className={({ isActive }) => (isActive ? 'active' : '')}>
            My Teams
          </NavLink>
          <NavLink to="/tournaments" className={({ isActive }) => (isActive ? 'active' : '')}>
            My Tournaments
          </NavLink>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <NotificationCenter />
        
        <div className="flex items-center gap-3">
          <Link to="/settings" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="avatar border-white/10">
              <User className="text-white" />
            </div>
            <div className="hidden sm:block text-left">
              <strong className="block text-xs font-semibold text-white truncate max-w-[120px]">
                {user?.fullName ?? 'Player'}
              </strong>
            </div>
          </Link>
          <button className="icon-button text-white hover:bg-white/10" onClick={() => void signOut()} aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
