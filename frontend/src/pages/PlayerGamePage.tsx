import { useQuery } from '@tanstack/react-query';
import { CalendarDays, ChevronDown, Clock3, Search, Trophy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { gameService } from '../features/games/gameService';
import { tournamentService } from '../features/tournaments/tournamentService';
import type { Game } from '../features/games/types';
import type { Tournament } from '../features/tournaments/types';

const gameFallbacks: Record<string, Game> = {
  'free-fire': {
    id: 'demo-free-fire', name: 'Free Fire', slug: 'free-fire', platform: 'MOBILE', teamSize: 4, substituteLimit: 1,
    description: 'Drop in, survive, and conquer in fast-paced battle royale tournaments.', active: true,
  },
  'pubg-mobile': {
    id: 'demo-pubg-mobile', name: 'PUBG Mobile', slug: 'pubg-mobile', platform: 'MOBILE', teamSize: 4, substituteLimit: 1,
    description: 'Compete in tactical mobile battle royale events and climb the rankings.', active: true,
  },
  efootball: {
    id: 'demo-efootball', name: 'eFootball', slug: 'efootball', platform: 'CROSS_PLATFORM', teamSize: 1, substituteLimit: 0,
    description: 'Experience pure football realism. Compete in 1v1 weekly cups, build your dream squad, and climb the global rankings.', active: true,
  },
};

const efootballFallback: Game = {
  id: 'demo-efootball', name: 'eFootball', slug: 'efootball', platform: 'CROSS_PLATFORM', teamSize: 1, substituteLimit: 0,
  description: 'Experience pure football realism. Compete in 1v1 weekly cups, build your dream squad, and climb the global rankings.', active: true,
};

const demoTournaments = [
  { label: 'LIVE NOW', tone: 'live', name: 'Pro League Season 4 – EU', meta: '16/16 Teams • $100,000 Prize Pool', action: 'VIEW DETAILS', icon: Trophy },
  { label: 'REG OPEN', tone: 'open', name: 'Weekend Kickoff Cup', meta: '42/64 Players • $5,000 Prize Pool', detail: 'STARTS OCT 28', action: 'REGISTER NOW', icon: CalendarDays },
  { label: 'CLOSING SOON', tone: 'closing', name: 'Global Masters Qualifiers', meta: '118/128 Players • $50,000 Prize Pool', action: 'REGISTER NOW', icon: Clock3 },
];

export function PlayerGamePage() {
  const { gameId: slug = '' } = useParams<{ gameId: string }>();
  const normalizedSlug = slug.toLowerCase().replace(/_/g, '-');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'UPCOMING' | 'ONGOING' | 'COMPLETED'>('UPCOMING');
  const games = useQuery({ queryKey: ['games'], queryFn: () => gameService.list() });
  const realGame = games.data?.content.find((item) => item.slug.toLowerCase().replace(/_/g, '-') === normalizedSlug || item.id === slug);
  const isEfootball = normalizedSlug === 'efootball' || realGame?.name.toLowerCase().includes('efootball');
  const game = realGame ?? gameFallbacks[normalizedSlug] ?? (isEfootball ? efootballFallback : undefined);
  const tournaments = useQuery({ queryKey: ['tournaments', 'game', realGame?.id], queryFn: () => tournamentService.list({ gameId: realGame!.id }), enabled: Boolean(realGame?.id) });
  const records = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (tournaments.data?.content ?? []).filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(query);
      const matchesTab = tab === 'UPCOMING'
        ? ['PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED'].includes(item.status)
        : tab === 'ONGOING' ? item.status === 'IN_PROGRESS' : item.status === 'COMPLETED';
      return matchesSearch && matchesTab;
    });
  }, [search, tab, tournaments.data]);

  if (games.isLoading) return <LoadingState message="Loading game..." />;
  if (!game) return <ErrorState message="Game not found or failed to load." />;

  return <div className={`game-showcase-page ${isEfootball ? 'game-showcase-page--efootball' : ''}`}>
    <section className="game-showcase-hero"><div className="game-showcase-hero__shade" /><div className="game-showcase-hero__content"><h1>{game.name}</h1><p>{game.description ?? `Compete in the best ${game.name} tournaments.`}</p></div></section>
    <main className="game-showcase-content">
      <div className="game-showcase-toolbar"><nav className="game-showcase-tabs" aria-label="Tournament status">{(['UPCOMING', 'ONGOING', 'COMPLETED'] as const).map((item) => <button key={item} className={tab === item ? 'is-active' : ''} onClick={() => setTab(item)}>{item}</button>)}</nav><div className="game-showcase-filters"><label><span>Region: Global</span><ChevronDown /></label><label><span>Format: All</span><ChevronDown /></label></div></div>
      <div className="game-showcase-list-heading"><h2>{tab[0] + tab.slice(1).toLowerCase()} competitions</h2><label className="game-showcase-search"><Search /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search competitions..." /></label></div>
      {tournaments.isError && <p className="game-showcase-note">Showing featured competitions while live data reconnects.</p>}
      {records.length > 0 ? <div className="game-showcase-cards">{records.map((item) => <TournamentShowcaseCard key={item.id} tournament={item} />)}</div> : !search.trim() && tab === 'UPCOMING' ? <div className="game-showcase-cards">{demoTournaments.map((item) => <DemoTournamentCard key={item.name} {...item} />)}</div> : <div className="game-showcase-empty">No {tab.toLowerCase()} competitions match your search.</div>}
    </main>
    <footer className="game-showcase-footer"><Link to="/games">ArenaHub</Link><span>Explore tournaments, build your team, and climb the rankings.</span></footer>
  </div>;
}

function TournamentShowcaseCard({ tournament }: { tournament: Tournament }) {
  return <DemoTournamentCard link={`/tournaments/${tournament.id}`} name={tournament.name} meta={`${tournament.maximumTeams} Teams • ${tournament.format.replaceAll('_', ' ')}`} label={tournament.status.replaceAll('_', ' ')} tone={tournament.status === 'IN_PROGRESS' ? 'live' : 'open'} action="VIEW DETAILS" icon={CalendarDays} />;
}

function DemoTournamentCard({ label, tone, name, meta, detail, action, link = '/tournaments', icon: Icon }: { label: string; tone: string; name: string; meta: string; detail?: string; action: string; link?: string; icon: typeof Trophy }) {
  return <article className="game-showcase-card"><div className={`game-showcase-card__label ${tone}`}><i />{label}<Icon /></div><h3>{name}</h3><p>{meta}</p>{detail && <small>{detail}</small>}<Link className="game-showcase-card__action" to={link}>{action}</Link></article>;
}
