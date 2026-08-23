import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Edit3,
  Filter,
  Grid2X2,
  List,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";
import { LoadingState } from "../components/common/LoadingState";
import { Modal } from "../components/common/Modal";
import { useAuthStore } from "../features/auth/authStore";
import { gameService } from "../features/games/gameService";
import type { GameInput, GamePlatform } from "../features/games/types";
import { getErrorMessage } from "../utils/apiError";
import { useNavigate } from "react-router-dom";

const emptyGame: GameInput = {
  name: "",
  slug: "",
  platform: "PC",
  teamSize: 5,
  substituteLimit: 2,
  description: "",
  active: true,
};

const gamePresentation: Record<
  string,
  { image: string; count: number; tags: string[]; description: string }
> = {
  "free-fire": {
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=90&w=1000",
    count: 18,
    tags: ["Mobile", "BR"],
    description:
      "Drop in, survive, and conquer. Join the ultimate mobile battle royale experience and...",
  },
  "pubg-mobile": {
    image:
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=90&w=1000",
    count: 12,
    tags: ["Mobile", "BR"],
    description:
      "The original battle royale on mobile. Tactical gameplay, realistic ballistics, and intense final...",
  },
  efootball: {
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=90&w=1000",
    count: 8,
    tags: ["Cross-play", "Sports"],
    description:
      "Experience pure football realism. Compete in 1v1 weekly cups, build your dream squad, and...",
  },
};

const referenceImage = "/ArenaHub%20-%20Games%20Discovery.png";

export function GamesPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [game, setGame] = useState(emptyGame);
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const games = useQuery({
    queryKey: ["games", user?.role],
    queryFn: () => gameService.list(user?.role === "SUPER_ADMIN"),
  });
  const saveGame = useMutation({
    mutationFn: () =>
      editingId
        ? gameService.update(editingId, game)
        : gameService.create(game),
    onSuccess: async () => {
      setOpen(false);
      setEditingId(null);
      setGame(emptyGame);
      setNotice("");
      await queryClient.invalidateQueries({ queryKey: ["games"] });
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });
  const removeGame = useMutation({
    mutationFn: gameService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["games"] }),
    onError: (error) => setNotice(getErrorMessage(error)),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    saveGame.mutate();
  };

  const filteredGames =
    games.data?.content.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) &&
      (!activeTag ||
        gamePresentation[item.slug]?.tags.some(
          (tag) => tag.toLowerCase() === activeTag.toLowerCase(),
        )),
    ) ?? [];

  return (
    <div className="games-discovery-page">
      <div className="games-discovery-content">
        <header className="games-discovery-heading">
          <div>
            <h1>Discover Games</h1>
            <p>
              Explore competitive titles on ArenaHub. Join active tournaments,
              build your
              <br className="games-discovery-heading__break" /> team, and climb
              the leaderboards in your favorite games.
            </p>
          </div>
          {user?.role === "SUPER_ADMIN" && (
            <button
              className="button button-primary"
              onClick={() => {
                setEditingId(null);
                setGame(emptyGame);
                setOpen(true);
              }}
            >
              <Plus /> Add game
            </button>
          )}
        </header>
        <div className="games-discovery-toolbar">
          <label className="games-discovery-search">
            <Search />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search games..."
            />
          </label>
          <button
            className={`games-discovery-filter ${filterOpen || activeTag ? "is-active" : ""}`}
            onClick={() => setFilterOpen((value) => !value)}
            aria-expanded={filterOpen}
          >
            <Filter /> Filter
          </button>
          <div className="games-discovery-view" aria-label="Game card view">
            <button
              className={view === "grid" ? "is-active" : ""}
              onClick={() => setView("grid")}
              aria-label="Grid view"
            >
              <Grid2X2 />
            </button>
            <button
              className={view === "list" ? "is-active" : ""}
              onClick={() => setView("list")}
              aria-label="List view"
            >
              <List />
            </button>
          </div>
        </div>
        {filterOpen && (
          <div className="games-discovery-filter-menu" aria-label="Filter games">
            {["Mobile", "BR", "Cross-play", "Sports"].map((tag) => (
              <button
                key={tag}
                className={activeTag === tag ? "is-active" : ""}
                onClick={() => {
                  setActiveTag(activeTag === tag ? null : tag);
                  setFilterOpen(false);
                }}
              >
                {tag}
              </button>
            ))}
            {activeTag && (
              <button className="is-clear" onClick={() => setActiveTag(null)}>
                Clear
              </button>
            )}
          </div>
        )}
        {games.isLoading && <LoadingState message="Loading games..." />}
        {games.isError && <ErrorState message={getErrorMessage(games.error)} />}
        {filteredGames.length === 0 && !games.isLoading && (
          <EmptyState title="No games found" />
        )}
        <div
          className={`games-discovery-grid ${view === "list" ? "games-discovery-grid--list" : ""}`}
        >
          {filteredGames.map((item) => {
            const presentation =
              gamePresentation[item.slug] ?? gamePresentation["free-fire"];
            return (
              <article className="games-discovery-card" key={item.id}>
                <div className="games-discovery-card__image">
                  <img
                    src={
                      item.slug === "efootball"
                        ? "/efootball-card.png"
                        : item.slug === "free-fire"
                          ? "/freefire-card.png"
                          : referenceImage
                    }
                    alt=""
                    loading="lazy"
                    className={
                      item.slug === "efootball" || item.slug === "free-fire"
                        ? "games-discovery-card__uploaded-image"
                        : `games-discovery-card__reference-image games-discovery-card__reference-image--${item.slug}`
                    }
                  />
                  <span>
                    <i /> {presentation.count} active
                  </span>
                </div>
                <div className="games-discovery-card__body">
                  <div className="games-discovery-card__title">
                    <h2>{item.name}</h2>
                    <div>
                      {presentation.tags.map((tag) => (
                        <small key={tag}>{tag}</small>
                      ))}
                    </div>
                  </div>
                  <p>{presentation.description}</p>
                  <div className="games-discovery-card__footer">
                    <div className="games-discovery-avatars">
                      <b /> <b /> <b />
                      <small>+{item.teamSize > 1 ? "1.5k" : "800"}</small>
                    </div>
                    <button
                      className="games-discovery-view-button"
                      onClick={() => navigate(`/games/${item.slug}`)}
                      type="button"
                    >
                      View <span>→</span>
                    </button>
                  </div>
                </div>
                {user?.role === "SUPER_ADMIN" && (
                  <div className="games-discovery-admin-actions">
                    <button
                      className="icon-button"
                      onClick={() => {
                        setEditingId(item.id);
                        setGame({
                          name: item.name,
                          slug: item.slug,
                          platform: item.platform,
                          teamSize: item.teamSize,
                          substituteLimit: item.substituteLimit,
                          description: item.description ?? "",
                          active: item.active,
                        });
                        setOpen(true);
                      }}
                      aria-label={`Edit ${item.name}`}
                    >
                      <Edit3 />
                    </button>
                    <button
                      className="icon-button danger"
                      onClick={() => removeGame.mutate(item.id)}
                      aria-label={`Delete ${item.name}`}
                    >
                      <Trash2 />
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>

      <Modal
        open={open}
        title={editingId ? "Edit competition game" : "Add competition game"}
        onClose={() => setOpen(false)}
      >
        <form className="form-stack" onSubmit={submit}>
          {notice && <div className="alert alert-error">{notice}</div>}
          <div className="form-grid">
            <label className="field">
              <span>Name</span>
              <input
                value={game.name}
                onChange={(event) =>
                  setGame({
                    ...game,
                    name: event.target.value,
                    slug: event.target.value
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, ""),
                  })
                }
                required
              />
            </label>
            <label className="field">
              <span>Slug</span>
              <input
                value={game.slug}
                onChange={(event) =>
                  setGame({ ...game, slug: event.target.value })
                }
                pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                required
              />
            </label>
          </div>
          <label className="field">
            <span>Platform</span>
            <select
              value={game.platform}
              onChange={(event) =>
                setGame({
                  ...game,
                  platform: event.target.value as GamePlatform,
                })
              }
            >
              <option value="PC">PC</option>
              <option value="MOBILE">Mobile</option>
              <option value="CONSOLE">Console</option>
              <option value="CROSS_PLATFORM">Cross platform</option>
            </select>
          </label>
          <div className="form-grid">
            <label className="field">
              <span>Starting team size</span>
              <input
                type="number"
                min={1}
                max={100}
                value={game.teamSize}
                onChange={(event) =>
                  setGame({ ...game, teamSize: Number(event.target.value) })
                }
              />
            </label>
            <label className="field">
              <span>Substitute limit</span>
              <input
                type="number"
                min={0}
                max={100}
                value={game.substituteLimit}
                onChange={(event) =>
                  setGame({
                    ...game,
                    substituteLimit: Number(event.target.value),
                  })
                }
              />
            </label>
          </div>
          <label className="field">
            <span>Description</span>
            <textarea
              rows={3}
              value={game.description}
              onChange={(event) =>
                setGame({ ...game, description: event.target.value })
              }
            />
          </label>
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={game.active}
              onChange={(event) =>
                setGame({ ...game, active: event.target.checked })
              }
            />
            Active game
          </label>
          <button
            className="button button-primary"
            disabled={saveGame.isPending}
          >
            {saveGame.isPending ? "Saving..." : "Save game"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
