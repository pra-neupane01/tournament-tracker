import type { FC } from "react";
import { Link } from "react-router-dom";
import { Bell, Search, UserRound } from "lucide-react";

const featuredGames = [
  {
    name: "Free Fire",
    tournaments: 24,
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=85&w=900",
  },
  {
    name: "PUBG Mobile",
    tournaments: 18,
    image:
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=85&w=900",
  },
  {
    name: "eFootball",
    tournaments: 12,
    image:
      "https://images.unsplash.com/photo-1518605368461-1f12523b0542?auto=format&fit=crop&q=85&w=900",
  },
];

const navLinks = [
  { label: "Games", to: "/games" },
  { label: "Tournaments", to: "/tournaments" },
  { label: "My Team", to: "/teams" },
  { label: "My Tournaments", to: "/tournaments" },
  { label: "Results", to: "/tournaments" },
];

export const LandingPage: FC = () => {
  return (
    <div className="arena-home">
      <header className="arena-home__header">
        <Link to="/" className="arena-home__logo">
          Arena<span>Hub</span>
        </Link>
        <nav className="arena-home__nav" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={link.label === "Tournaments" ? "is-active" : ""}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="arena-home__actions">
          <button type="button" aria-label="Search">
            <Search />
          </button>
          <button type="button" aria-label="Notifications">
            <Bell />
          </button>
          <Link to="/login" className="arena-home__avatar" aria-label="Sign in">
            <UserRound />
          </Link>
        </div>
      </header>

      <main>
        <section className="arena-home__hero">
          <div className="arena-home__hero-content">
            <span className="arena-home__eyebrow">Collegiate Season 2024</span>
            <h1>
              The Home of
              <br />
              <strong>Collegiate Esports</strong>
            </h1>
            <p>
              Compete against top universities, build your legacy, and win your
              share of the prize pool. Join the ultimate platform for collegiate
              competitive gaming.
            </p>
            <div className="arena-home__hero-actions">
              <Link to="/tournaments" className="arena-home__primary">
                Find a tournament
              </Link>
              <Link to="/games" className="arena-home__secondary">
                Explore games
              </Link>
            </div>
          </div>
        </section>

        <section
          className="arena-home__featured"
          aria-labelledby="featured-title"
        >
          <div className="arena-home__section-heading">
            <h2 id="featured-title">Featured Titles</h2>
            <p>Top competitive games in the current season.</p>
          </div>
          <div className="arena-home__game-grid">
            {featuredGames.map((game) => (
              <Link
                to="/games"
                className="arena-home__game-card"
                key={game.name}
              >
                <img src={game.image} alt="" />
                <span className="arena-home__game-shade" />
                <span className="arena-home__game-info">
                  <strong>{game.name}</strong>
                  <small>
                    <i /> {game.tournaments} active tournaments
                  </small>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="arena-home__footer">
        <Link to="/" className="arena-home__logo">
          Arena<span>Hub</span>
        </Link>
        <nav aria-label="Footer navigation">
          <Link to="/help">Support</Link>
          <Link to="/help">FAQ</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
        </nav>
        <small>© 2024 ArenaHub Esports. All rights reserved.</small>
      </footer>
    </div>
  );
};
