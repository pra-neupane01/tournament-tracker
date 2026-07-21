import { useNavigate } from 'react-router-dom';
import { Trophy, Users } from 'lucide-react';

const games = [
  { id: 'free-fire', name: 'Free Fire', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800' },
  { id: 'pubg-mobile', name: 'PUBG Mobile', image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=800' },
  { id: 'efootball', name: 'eFootball', image: 'https://images.unsplash.com/photo-1518605368461-1f12523b0542?auto=format&fit=crop&q=80&w=800' },
  { id: 'mobile-legends', name: 'Mobile Legends', image: 'https://images.unsplash.com/photo-1538481199005-27dec2909f41?auto=format&fit=crop&q=80&w=800' },
];

export function PlayerHomePage() {
  const navigate = useNavigate();

  return (
    <div className="w-full flex flex-col min-h-full">

      {/* ───── Hero Section ───── */}
      <section className="arena-hero">
        {/* Ambient background glows */}
        <div className="arena-hero__glow arena-hero__glow--cyan" aria-hidden="true" />
        <div className="arena-hero__glow arena-hero__glow--purple" aria-hidden="true" />

        {/* Optional grid overlay */}
        <div className="arena-hero__grid" aria-hidden="true" />

        <div className="arena-hero__content">
          <h1 className="arena-hero__title">
            Compete with the <span className="arena-hero__title-accent">Best</span>
          </h1>
          <p className="arena-hero__subtitle">
            Join the most prestigious tournaments, track your stats, and climb the
            leaderboards in your favorite games.
          </p>

          <div className="arena-hero__ctas">
            <button
              className="arena-btn arena-btn--primary"
              onClick={() => navigate('/tournaments')}
            >
              <Trophy className="h-5 w-5" />
              Browse Tournaments
            </button>
            <button
              className="arena-btn arena-btn--outline"
              onClick={() => navigate('/teams')}
            >
              <Users className="h-5 w-5" />
              Create a Team
            </button>
          </div>
        </div>
      </section>

      {/* ───── Game Discovery ───── */}
      <section className="game-discovery-section flex-1">
        <h2>Discover Games</h2>

        <div className="game-card-grid">
          {games.map((game) => (
            <div
              key={game.id}
              className="player-game-card group"
              onClick={() => navigate(`/games/${game.id}`)}
            >
              <img src={game.image} alt={game.name} loading="lazy" />
              <div className="player-game-card-content">
                <h3>{game.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
