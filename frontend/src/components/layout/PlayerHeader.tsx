import { LogOut, Menu, User, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/authStore';
import { NotificationCenter } from '../notifications/NotificationCenter';

export function PlayerHeader() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const signOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/games', label: 'Games' },
    { to: '/teams', label: 'My Teams' },
    { to: '/tournaments', label: 'My Tournaments' },
  ];

  return (
    <header className="player-navbar">
      <div className="flex items-center gap-6">
        <button
          className="icon-button md:hidden"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5 text-white" />
        </button>
        <Link to="/" className="font-bold text-xl text-white tracking-tight flex items-center gap-2">
          <span className="text-[var(--color-primary)]">Esports</span>Manager
        </Link>

        <nav className="player-nav-links">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {link.label}
            </NavLink>
          ))}
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

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[var(--color-background)]/95 backdrop-blur-md md:hidden">
          <div className="flex h-16 items-center justify-between border-b border-white/5 px-6">
            <Link 
              to="/" 
              className="font-bold text-xl text-white tracking-tight flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="text-[var(--color-primary)]">Esports</span>Manager
            </Link>
            <button
              className="icon-button text-white"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col p-6 space-y-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => 
                  `block text-lg font-medium transition-colors ${isActive ? 'text-[var(--color-primary)]' : 'text-white/70 hover:text-white'}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
