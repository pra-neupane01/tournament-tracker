import { Calendar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDateTime } from '../../utils/date';
import type { TournamentResponse } from '../../features/tournaments/types';

export function PlayerTournamentCard({ tournament }: { tournament: TournamentResponse }) {
  return (
    <article className="player-tournament-card">
      <div className="player-tournament-card-header">
        <span className="status-pill mb-2">
          {tournament.status.replace('_', ' ')}
        </span>
        <h3 className="text-xl font-bold text-white leading-tight">
          {tournament.name}
        </h3>
      </div>
      
      <div className="player-tournament-card-body">
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
          <Calendar className="h-4 w-4" />
          <span>{formatDateTime(tournament.startDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
          <Users className="h-4 w-4" />
          <span>{tournament.participantCount} / {tournament.maxTeams} Teams</span>
        </div>
        
        <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
            {tournament.format.replace('_', ' ')}
          </span>
          <Link 
            to={`/tournaments/${tournament.id}`} 
            className="text-sm font-semibold text-[var(--color-primary)] hover:text-white transition-colors"
          >
            View Details &rarr;
          </Link>
        </div>
      </div>
    </article>
  );
}
