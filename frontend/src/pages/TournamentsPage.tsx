import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Check, ChevronDown, Search, Trophy, Users } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { PageContainer } from '../components/layout/PageContainer';
import { gameService } from '../features/games/gameService';
import { tournamentService } from '../features/tournaments/tournamentService';
import { useAuthStore } from '../features/auth/authStore';
import type {
  TournamentStatus,
} from '../features/tournaments/types';
import { getErrorMessage } from '../utils/apiError';
import { formatDateTime } from '../utils/date';



export function TournamentsPage() {
  const user = useAuthStore((state) => state.user);
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


  if (user?.role === 'PLAYER') {
    return <PlayerTournamentDiscovery games={games.data?.content ?? []} tournaments={tournaments.data?.content ?? []} query={query} setQuery={setQuery} />;
  }

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

function PlayerTournamentDiscovery({ games, tournaments, query, setQuery }: { games: { id: string; name: string }[]; tournaments: { id: string; name: string; gameName: string; status: TournamentStatus; startsAt: string; maximumTeams: number; format: string }[]; query: string; setQuery: (value: string) => void }) {
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'UPCOMING' | 'ONGOING' | 'COMPLETED'>('UPCOMING');
  const [region, setRegion] = useState('Global');
  const filtered = tournaments.filter((item) => !query || item.name.toLowerCase().includes(query.toLowerCase()));
  const demo = [
    { id: 'winter-invitational', game: 'Free Fire', name: 'Winter Invitational 2024', status: 'REGISTRATION_OPEN', meta: 'Oct 15 - Oct 20', teams: '24/64 Teams', prize: '$50,000 Prize Pool', image: '/freefire-card.png' },
    { id: 'global-championship', game: 'PUBG Mobile', name: 'Global Championship Qualifiers', status: 'REGISTRATION_OPEN', meta: 'Nov 01 - Nov 10', teams: '112/128 Teams', prize: '$250,000 Prize Pool', image: '/ArenaHub%20-%20Games%20Discovery.png' },
    { id: 'pro-league-eu', game: 'eFootball', name: 'Pro League Season 4 – EU', status: 'IN_PROGRESS', meta: 'Sep 01 - Dec 15', teams: '16/16 Teams', prize: '$100,000 Prize Pool', image: '/efootball-card.png' },
    { id: 'latam-challenger', game: 'Free Fire', name: 'LATAM Challenger Series', status: 'REGISTRATION_OPEN', meta: 'Oct 25 - Oct 28', teams: '48/64 Teams', prize: '$20,000 Prize Pool', image: '/freefire-card.png' },
  ].filter((item) => !selectedGames.length || selectedGames.includes(item.game));
  const showLive = selectedStatus === 'ONGOING';
  const showCompleted = selectedStatus === 'COMPLETED';
  const cards = filtered.length ? filtered.map((item) => ({ id: item.id, game: item.gameName, name: item.name, status: item.status, meta: formatDateTime(item.startsAt), teams: `${item.maximumTeams} Teams`, prize: 'Prize Pool', image: item.gameName.toLowerCase().includes('efootball') ? '/efootball-card.png' : '/freefire-card.png' })) : demo.filter((item) => showLive ? item.status === 'IN_PROGRESS' : showCompleted ? false : true);
  const toggleGame = (name: string) => setSelectedGames((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);

  return <div className="tournament-discovery-page">
    <section className="tournament-discovery-heading"><div><h1>Discover Tournaments</h1><p>Find and compete in premium esports events globally.</p></div><label className="tournament-discovery-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tournaments, teams..." /></label></section>
    <div className="tournament-discovery-layout">
      <aside className="tournament-discovery-sidebar"><span className="tournament-discovery-eyebrow">GAMES</span>{['All Games', ...games.map((game) => game.name)].slice(0, 4).map((game, index) => { const active = index === 0 ? selectedGames.length === 0 : selectedGames.includes(game); return <button key={game} onClick={() => index === 0 ? setSelectedGames([]) : toggleGame(game)} className={active ? 'is-active' : ''}>{active ? <Check /> : <i />}{game}</button>; })}<span className="tournament-discovery-eyebrow">STATUS</span><div className="tournament-discovery-status">{(['UPCOMING', 'ONGOING', 'COMPLETED'] as const).map((item) => <button key={item} className={selectedStatus === item ? 'is-active' : ''} onClick={() => setSelectedStatus(item)}>{item[0] + item.slice(1).toLowerCase()}</button>)}</div><span className="tournament-discovery-eyebrow">REGION</span><label className="tournament-discovery-select"><select value={region} onChange={(event) => setRegion(event.target.value)}><option>Global</option><option>Europe</option><option>Asia Pacific</option><option>Americas</option></select><ChevronDown /></label></aside>
      <section className="tournament-discovery-results"><div className="tournament-discovery-results__meta"><span>{region} events · {cards.length} available</span></div><div className="tournament-discovery-cards">{cards.map((card) => <article className="tournament-discovery-card" key={card.id}><div className="tournament-discovery-card__image" style={{ backgroundImage: `url(${card.image})` }}><span className={card.status === 'IN_PROGRESS' ? 'is-live' : ''}><i />{card.status === 'IN_PROGRESS' ? 'Live Now' : 'Reg Open'}</span></div><div className="tournament-discovery-card__body"><small>{card.game}</small><h2>{card.name}</h2><div className="tournament-discovery-card__stats"><span><CalendarDays />{card.meta}</span><span><Users />{card.teams}</span></div><strong>▣ {card.prize}</strong><Link to={`/tournaments/${card.id}`} className={card.status === 'IN_PROGRESS' ? 'is-outline' : ''}>{card.status === 'IN_PROGRESS' ? 'View Details' : 'Register Now'}</Link></div></article>)}</div></section>
    </div>
  </div>;
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
