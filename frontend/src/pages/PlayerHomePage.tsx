import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarDays,
  Radio,
  Search,
  Trophy,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ErrorState } from "../components/common/ErrorState";
import { LoadingState } from "../components/common/LoadingState";
import { discoveryService } from "../features/discovery/discoveryService";
import type { Game } from "../features/games/types";
import type { Tournament } from "../features/tournaments/types";

const gameImages: Record<string, string> = {
  "free-fire":
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=900",
  "pubg-mobile":
    "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=900",
  efootball:
    "https://images.unsplash.com/photo-1518605368461-1f12523b0542?auto=format&fit=crop&q=80&w=900",
  "mobile-legends":
    "https://images.unsplash.com/photo-1538481199005-27dec2909f41?auto=format&fit=crop&q=80&w=900",
};

const formatLabel = (value: string) => value.replaceAll("_", " ").toLowerCase();

function TournamentPreview({ tournament }: { tournament: Tournament }) {
  const isLive = tournament.status === "IN_PROGRESS";
  const start = new Date(tournament.startsAt);
  return (
    <Link
      to={`/tournaments/${tournament.id}`}
      className="discovery-tournament-card"
    >
      <div className="discovery-tournament-card__topline">
        <span
          className={
            isLive
              ? "discovery-status discovery-status--live"
              : "discovery-status"
          }
        >
          {isLive && <Radio className="h-3.5 w-3.5" />}
          {isLive ? "Live now" : "Open to enter"}
        </span>
        <span>{tournament.gameName}</span>
      </div>
      <h3>{tournament.name}</h3>
      <p>{tournament.organizationName}</p>
      <div className="discovery-tournament-card__meta">
        <span>
          <CalendarDays />{" "}
          {isLive
            ? "Happening now"
            : start.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
        </span>
        <span>
          <Users /> {tournament.maximumTeams} teams
        </span>
      </div>
      <div className="discovery-tournament-card__footer">
        <span>{formatLabel(tournament.format)}</span>
        <ArrowRight />
      </div>
    </Link>
  );
}

function GameTile({ game }: { game: Game }) {
  return (
    <Link to={`/games/${game.slug}`} className="discovery-game-tile">
      {gameImages[game.slug] && (
        <img src={gameImages[game.slug]} alt="" loading="lazy" />
      )}
      <span className="discovery-game-tile__shade" />
      <span className="discovery-game-tile__content">
        <span className="discovery-game-tile__platform">
          {formatLabel(game.platform)}
        </span>
        <strong>{game.name}</strong>
        <span className="discovery-game-tile__arrow">
          <ArrowRight />
        </span>
      </span>
    </Link>
  );
}

export function PlayerHomePage() {
  const navigate = useNavigate();
  const discovery = useQuery({
    queryKey: ["discovery", "home"],
    queryFn: discoveryService.home,
  });

  if (discovery.isLoading)
    return <LoadingState message="Loading the arena..." />;
  if (discovery.isError)
    return <ErrorState message="We could not load the arena right now." />;

  const games = discovery.data?.games ?? [];
  const tournaments = discovery.data?.tournaments ?? [];
  const liveTournaments = tournaments.filter(
    (item) => item.status === "IN_PROGRESS",
  );
  const upcomingTournaments = tournaments.filter(
    (item) => item.status !== "IN_PROGRESS",
  );

  return (
    <div className="discovery-page">
      <section className="discovery-hero">
        <div className="discovery-hero__content">
          <span className="discovery-kicker">
            <span /> The competitive network for every player
          </span>
          <h1>
            Find your next <em>match.</em>
          </h1>
          <p>
            Discover tournaments, build your squad, and make your mark across
            the games you play.
          </p>
          <div className="discovery-hero__actions">
            <button
              className="discovery-primary-action"
              onClick={() => navigate("/tournaments")}
            >
              <Search /> Explore tournaments
            </button>
            <Link to="/teams" className="discovery-secondary-action">
              <Users /> Find a team
            </Link>
          </div>
        </div>
        <div className="discovery-hero__signal" aria-hidden="true">
          <Trophy />
          <span>SEASON 08</span>
        </div>
      </section>
      <main className="discovery-content">
        <section className="discovery-section discovery-section--games">
          <div className="discovery-section__heading">
            <div>
              <span className="discovery-eyebrow">Choose your battlefield</span>
              <h2>Play your game</h2>
            </div>
            <Link to="/games">
              View all <ArrowRight />
            </Link>
          </div>
          {games.length === 0 ? (
            <p className="discovery-empty">No games are available yet.</p>
          ) : (
            <div className="discovery-game-grid">
              {games.slice(0, 4).map((game) => (
                <GameTile key={game.id} game={game} />
              ))}
            </div>
          )}
        </section>
        {liveTournaments.length > 0 && (
          <section className="discovery-section">
            <div className="discovery-section__heading">
              <div>
                <span className="discovery-eyebrow discovery-eyebrow--live">
                  Live competition
                </span>
                <h2>Happening now</h2>
              </div>
              <Link to="/tournaments">
                See all <ArrowRight />
              </Link>
            </div>
            <div className="discovery-tournament-grid">
              {liveTournaments.slice(0, 3).map((item) => (
                <TournamentPreview key={item.id} tournament={item} />
              ))}
            </div>
          </section>
        )}
        <section className="discovery-section">
          <div className="discovery-section__heading">
            <div>
              <span className="discovery-eyebrow">Your next opportunity</span>
              <h2>Upcoming tournaments</h2>
            </div>
            <Link to="/tournaments">
              Browse all <ArrowRight />
            </Link>
          </div>
          {upcomingTournaments.length === 0 ? (
            <p className="discovery-empty">
              New tournaments are on the way. Check back soon.
            </p>
          ) : (
            <div className="discovery-tournament-grid">
              {upcomingTournaments.slice(0, 6).map((item) => (
                <TournamentPreview key={item.id} tournament={item} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
