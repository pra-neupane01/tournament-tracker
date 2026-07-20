import { Link, useNavigate } from 'react-router-dom';

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
      {/* Hero Section */}
      <section className="player-hero">
        <div className="player-hero-content">
          <h1>Compete with the Best</h1>
          <p>
            Join the most prestigious tournaments, track your stats, and climb the leaderboards in your favorite games.
          </p>
        </div>
      </section>

      {/* Game Discovery Section */}
      <section className="game-discovery-section flex-1">
        <h2>Discover Games</h2>
        
        <div className="game-card-grid">
          {games.map((game) => (
            <div 
              key={game.id} 
              className="player-game-card"
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
