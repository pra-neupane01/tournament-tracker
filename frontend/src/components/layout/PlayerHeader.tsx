import { LogOut, Menu, Search, User, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/authStore';
import { NotificationCenter } from '../notifications/NotificationCenter';

export function PlayerHeader() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const signOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const navLinks = [
    { to: '/games', label: 'Games' },
    { to: '/tournaments', label: 'Tournaments' },
    { to: '/teams', label: 'My Team' },
    { to: '/matches', label: 'Results' },
  ];

  return (
    <header
      className={`arena-navbar ${scrolled ? 'arena-navbar--scrolled' : ''}`}
    >
      <div className="arena-navbar__inner">
        {/* Left — Brand */}
        <div className="flex items-center gap-6">
          <button
            className="arena-hamburger md:hidden"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link to="/" className="arena-brand group" aria-label="ArenaHub home">
            <span className="arena-brand__arena">Arena</span>
            <span className="arena-brand__hub">Hub</span>
          </Link>
        </div>

        {/* Center — Nav Links */}
        <nav className="arena-nav" aria-label="Main navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `arena-nav__link ${isActive ? 'arena-nav__link--active' : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right — Actions */}
        <div className="arena-header-actions">
          <label className="arena-header-search">
            <Search aria-hidden="true" />
            <input type="search" placeholder="Search games..." aria-label="Search games" />
          </label>
          <NotificationCenter />

          <Link
            to="/profile"
            className="arena-profile-pill"
            aria-label="User settings"
          >
            <span className="arena-profile-pill__avatar">
              <User className="h-4 w-4" />
            </span>
            <span className="arena-profile-pill__name hidden sm:block">
              {user?.fullName ?? 'Player'}
            </span>
          </Link>

          <button
            className="arena-logout-btn"
            onClick={() => void signOut()}
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* ───── Mobile Slide-out Menu ───── */}
      {/* Backdrop */}
      <div
        className={`arena-mobile-backdrop ${mobileMenuOpen ? 'arena-mobile-backdrop--visible' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`arena-mobile-panel ${mobileMenuOpen ? 'arena-mobile-panel--open' : ''}`}
      >
        <div className="arena-mobile-panel__header">
          <Link
            to="/"
            className="arena-brand group"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="arena-brand__arena">Arena</span>
            <span className="arena-brand__hub">Hub</span>
          </Link>
          <button
            className="arena-hamburger"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="arena-mobile-nav" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `arena-mobile-nav__link ${isActive ? 'arena-mobile-nav__link--active' : ''}`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="arena-mobile-panel__footer">
          <Link
            to="/settings"
            className="arena-profile-pill arena-profile-pill--mobile"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="arena-profile-pill__avatar">
              <User className="h-4 w-4" />
            </span>
            <span className="arena-profile-pill__name">
              {user?.fullName ?? 'Player'}
            </span>
          </Link>
          <button
            className="arena-logout-btn arena-logout-btn--mobile"
            onClick={() => void signOut()}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
