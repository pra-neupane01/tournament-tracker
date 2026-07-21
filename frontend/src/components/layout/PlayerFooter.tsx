import { Link } from 'react-router-dom';

export function PlayerFooter() {
  return (
    <footer className="player-footer">
      <div className="player-footer-grid">
        <div className="player-footer-col">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="ArenaHub" className="h-8 w-auto object-contain" />
          </Link>
          <p className="text-sm text-[var(--color-text-muted)] mt-4">
            The ultimate platform for competitive gaming. Join tournaments, build teams, and climb the leaderboards.
          </p>
        </div>

        <div className="player-footer-col">
          <h4>Support</h4>
          <ul>
            <li><Link to="/help">Help Center</Link></li>
            <li><Link to="/rules">Tournament Rules</Link></li>
            <li><Link to="/report">Report an Issue</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>

        <div className="player-footer-col">
          <h4>Getting Started</h4>
          <ul>
            <li><Link to="/register">Create an Account</Link></li>
            <li><Link to="/teams/create">Build a Team</Link></li>
            <li><Link to="/games">Find Tournaments</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
          </ul>
        </div>

        <div className="player-footer-col">
          <h4>Legal</h4>
          <ul>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/cookies">Cookie Policy</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="mt-12 pt-8 border-t border-[var(--color-border)] text-center text-sm text-[var(--color-text-muted)]">
        &copy; {new Date().getFullYear()} ArenaHub. All rights reserved.
      </div>
    </footer>
  );
}
