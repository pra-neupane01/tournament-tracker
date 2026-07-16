import { ArrowLeft, CalendarDays, Gamepad2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Tournament } from '../../features/tournaments/types';
import { formatDateTime } from '../../utils/date';

export function TournamentHeader({ tournament }: { tournament: Tournament }) {
  return (
    <div className="tournament-hero">
      <Link to="/tournaments" className="back-link">
        <ArrowLeft /> All tournaments
      </Link>
      <div className="tournament-hero-content">
        <div>
          <div className="eyebrow">
            {tournament.organizationName} · {tournament.format.replaceAll('_', ' ')}
          </div>
          <h1>{tournament.name}</h1>
          <div className="tournament-meta">
            <span>
              <Gamepad2 /> {tournament.gameName}
            </span>
            <span>
              <CalendarDays /> {formatDateTime(tournament.startsAt)}
            </span>
          </div>
        </div>
        <span className="status-pill">{tournament.status.replaceAll('_', ' ')}</span>
      </div>
    </div>
  );
}
