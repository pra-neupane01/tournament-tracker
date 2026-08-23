import { Link } from 'react-router-dom';

export function PlayerFooter() {
  return (
    <footer className="player-footer">
      <Link to="/" className="player-footer__brand">ArenaHub</Link>
      <nav aria-label="Footer navigation">
        <Link to="/help">Support</Link>
        <Link to="/faq">FAQ</Link>
        <Link to="/terms">Terms</Link>
        <Link to="/privacy">Privacy</Link>
      </nav>
      <span className="player-footer__copyright">© {new Date().getFullYear()} ArenaHub Esports. All rights reserved.</span>
    </footer>
  );
}
