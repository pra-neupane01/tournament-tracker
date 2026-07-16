import { Bell, LogOut, Menu, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/authStore';

export function Header() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const signOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors">
          <Menu className="h-5 w-5" />
        </button>
        <Link to="/" className="font-bold text-lg text-[var(--color-primary)] tracking-tight">
          EsportsManager
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="icon-button relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </button>
        <div className="header-account">
          <div className="avatar">
            <User />
          </div>
          <div className="hidden sm:block">
            <strong>{user?.fullName ?? 'Account'}</strong>
            <span>{user?.role.replaceAll('_', ' ')}</span>
          </div>
          <button className="icon-button" onClick={() => void signOut()} aria-label="Sign out">
            <LogOut />
          </button>
        </div>
      </div>
    </header>
  );
}
