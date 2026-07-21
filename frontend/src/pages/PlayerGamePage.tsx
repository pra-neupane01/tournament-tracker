import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Search } from 'lucide-react';
import { useState } from 'react';
import { gameService } from '../features/games/gameService';
import { tournamentService } from '../features/tournaments/tournamentService';
import { PlayerTournamentCard } from '../components/player/PlayerTournamentCard';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';

// Fallback images matching the home page
const gameImages: Record<string, string> = {
  'free-fire': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1600',
  'pubg-mobile': 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=1600',
  'efootball': 'https://images.unsplash.com/photo-1518605368461-1f12523b0542?auto=format&fit=crop&q=80&w=1600',
  'mobile-legends': 'https://images.unsplash.com/photo-1538481199005-27dec2909f41?auto=format&fit=crop&q=80&w=1600',
};

export function PlayerGamePage() {
  const { gameId: slug } = useParams<{ gameId: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  
  // 1. Fetch games to find the real game ID
  const games = useQuery({
    queryKey: ['games'],
    queryFn: () => gameService.list(),
  });

  const game = games.data?.content.find((g) => g.slug === slug || g.id === slug);
  const heroImage = slug && gameImages[slug] ? gameImages[slug] : gameImages['free-fire'];

  // 2. Fetch tournaments for this game
  const tournaments = useQuery({
    queryKey: ['tournaments', 'game', game?.id],
    queryFn: () => tournamentService.list({ gameId: game?.id }),
    enabled: !!game?.id,
  });

  if (games.isLoading) {
    return <LoadingState message="Loading game..." />;
  }

  if (games.isError || !game) {
    return (
      <div className="p-8">
        <Link to="/" className="back-link mb-6 inline-flex items-center gap-2 text-white">
          <ChevronLeft className="h-4 w-4" /> Back to Games
        </Link>
        <ErrorState message="Game not found or failed to load." />
      </div>
    );
  }

  const filteredTournaments = tournaments.data?.content.filter((t) => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? [];

  const upcomingTournaments = filteredTournaments.filter(t => t.status === 'PUBLISHED' || t.status === 'REGISTRATION_OPEN');
  const ongoingTournaments = filteredTournaments.filter(t => t.status === 'IN_PROGRESS');

  return (
    <div className="w-full flex flex-col min-h-full pb-12">
      {/* Game Hero */}
      <section className="relative h-64 md:h-80 flex items-end pb-8 border-b border-[var(--color-border)]">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40" 
          style={{ backgroundImage: `url(${heroImage})` }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/80 to-transparent" />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-start gap-4">
          <Link to="/" className="back-link text-white/70 hover:text-white transition-colors">
            <ChevronLeft /> Back to Games
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">{game.name}</h1>
          <p className="text-[var(--color-text-muted)] max-w-xl">
            {game.description || `Compete in the best ${game.name} tournaments.`}
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="w-full max-w-7xl mx-auto px-6 mt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h2 className="text-2xl font-bold text-white">Tournaments</h2>
          
          <div className="search-box w-full md:w-auto max-w-sm">
            <Search />
            <input 
              type="text" 
              placeholder="Search tournaments..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-white placeholder:text-white/50"
            />
          </div>
        </div>

        {tournaments.isLoading && <LoadingState message="Loading tournaments..." />}
        {tournaments.isError && <ErrorState message="Failed to load tournaments." />}

        {!tournaments.isLoading && filteredTournaments.length === 0 && (
          <EmptyState title="No tournaments found" message="Check back later for new competitions." />
        )}

        {ongoingTournaments.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Ongoing Now
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {ongoingTournaments.map(t => (
                <PlayerTournamentCard key={t.id} tournament={t} />
              ))}
            </div>
          </div>
        )}

        {upcomingTournaments.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Upcoming</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingTournaments.map(t => (
                <PlayerTournamentCard key={t.id} tournament={t} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
