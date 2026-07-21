import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Search, Trophy, Users } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { PageContainer } from '../components/layout/PageContainer';
import { gameService } from '../features/games/gameService';
import { tournamentService } from '../features/tournaments/tournamentService';
import type {
  TournamentStatus,
} from '../features/tournaments/types';
import { getErrorMessage } from '../utils/apiError';
import { formatDateTime } from '../utils/date';



export function TournamentsPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<TournamentStatus | ''>('');
  const [gameId, setGameId] = useState('');

  const games = useQuery({ queryKey: ['games'], queryFn: () => gameService.list() });
  const tournaments = useQuery({
    queryKey: ['tournaments', query, status, gameId],
    queryFn: () =>
      tournamentService.list({
        query: query || undefined,
        status: status || undefined,
        gameId: gameId || undefined,
      }),
  });


  return (
    <PageContainer
      title="Tournaments"
      description="Create, publish, and operate structured competitions."
    >
      <div className="page-toolbar tournament-filters">
        <label className="search-box">
          <Search />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tournaments"
          />
        </label>
        <select value={gameId} onChange={(event) => setGameId(event.target.value)}>
          <option value="">All games</option>
          {games.data?.content.map((game) => (
            <option key={game.id} value={game.id}>
              {game.name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as TournamentStatus | '')}
        >
          <option value="">All statuses</option>
          {statusOptions.map((item) => (
            <option key={item} value={item}>
              {item.replaceAll('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {tournaments.isLoading && <LoadingState message="Loading tournaments..." />}
      {tournaments.isError && <ErrorState message={getErrorMessage(tournaments.error)} />}
      {tournaments.data?.content.length === 0 && <EmptyState title="No tournaments found" />}
      <div className="tournament-grid">
        {tournaments.data?.content.map((item) => (
          <Link to={`/tournaments/${item.id}`} className="tournament-card" key={item.id}>
            <div className="tournament-card-top">
              <div className="resource-icon">
                <Trophy />
              </div>
              <span className="status-pill">{item.status.replaceAll('_', ' ')}</span>
            </div>
            <div>
              <span className="eyebrow">{item.organizationName}</span>
              <h2>{item.name}</h2>
              <p>{item.gameName} · {item.format.replaceAll('_', ' ')}</p>
            </div>
            <div className="tournament-card-meta">
              <span>
                <CalendarDays /> {formatDateTime(item.startsAt)}
              </span>
              <span>
                <Users /> {item.minimumTeams}–{item.maximumTeams} teams
              </span>
            </div>
          </Link>
        ))}
      </div>


    </PageContainer>
  );
}

const statusOptions: TournamentStatus[] = [
  'DRAFT',
  'PUBLISHED',
  'REGISTRATION_OPEN',
  'REGISTRATION_CLOSED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
];
