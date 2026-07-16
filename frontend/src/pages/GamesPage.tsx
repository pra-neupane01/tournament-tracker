import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit3, Gamepad2, MonitorSmartphone, Plus, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { Modal } from '../components/common/Modal';
import { PageContainer } from '../components/layout/PageContainer';
import { useAuthStore } from '../features/auth/authStore';
import { gameService } from '../features/games/gameService';
import type { GameInput, GamePlatform } from '../features/games/types';
import { getErrorMessage } from '../utils/apiError';

const emptyGame: GameInput = {
  name: '',
  slug: '',
  platform: 'PC',
  teamSize: 5,
  substituteLimit: 2,
  description: '',
  active: true,
};

export function GamesPage() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [game, setGame] = useState(emptyGame);
  const [notice, setNotice] = useState('');
  const games = useQuery({
    queryKey: ['games', user?.role],
    queryFn: () => gameService.list(user?.role === 'SUPER_ADMIN'),
  });
  const saveGame = useMutation({
    mutationFn: () =>
      editingId ? gameService.update(editingId, game) : gameService.create(game),
    onSuccess: async () => {
      setOpen(false);
      setEditingId(null);
      setGame(emptyGame);
      setNotice('');
      await queryClient.invalidateQueries({ queryKey: ['games'] });
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });
  const removeGame = useMutation({
    mutationFn: gameService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['games'] }),
    onError: (error) => setNotice(getErrorMessage(error)),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    saveGame.mutate();
  };

  return (
    <PageContainer
      title="Game catalog"
      description="Competition titles and their roster constraints."
      action={
        user?.role === 'SUPER_ADMIN' ? (
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
        ) : null
      }
    >
      {games.isLoading && <LoadingState message="Loading games..." />}
      {games.isError && <ErrorState message={getErrorMessage(games.error)} />}
      {games.data?.content.length === 0 && <EmptyState title="No games configured" />}
      <div className="card-grid">
        {games.data?.content.map((item) => (
          <article className="resource-card" key={item.id}>
            <div className="resource-icon">
              <Gamepad2 />
            </div>
            <div>
              <div className="resource-title">
                <h2>{item.name}</h2>
                <span className={`badge ${item.active ? 'badge-success' : 'badge-warning'}`}>
                  {item.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p>{item.platform.replaceAll('_', ' ')}</p>
              <span>
                <MonitorSmartphone /> {item.teamSize} starters · {item.substituteLimit} substitutes
              </span>
            </div>
            {user?.role === 'SUPER_ADMIN' && (
              <div className="resource-actions">
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
                      description: item.description ?? '',
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
        ))}
      </div>

      <Modal
        open={open}
        title={editingId ? 'Edit competition game' : 'Add competition game'}
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
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/^-|-$/g, ''),
                  })
                }
                required
              />
            </label>
            <label className="field">
              <span>Slug</span>
              <input
                value={game.slug}
                onChange={(event) => setGame({ ...game, slug: event.target.value })}
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
                setGame({ ...game, platform: event.target.value as GamePlatform })
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
                onChange={(event) => setGame({ ...game, teamSize: Number(event.target.value) })}
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
                  setGame({ ...game, substituteLimit: Number(event.target.value) })
                }
              />
            </label>
          </div>
          <label className="field">
            <span>Description</span>
            <textarea
              rows={3}
              value={game.description}
              onChange={(event) => setGame({ ...game, description: event.target.value })}
            />
          </label>
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={game.active}
              onChange={(event) => setGame({ ...game, active: event.target.checked })}
            />
            Active game
          </label>
          <button className="button button-primary" disabled={saveGame.isPending}>
            {saveGame.isPending ? 'Saving...' : 'Save game'}
          </button>
        </form>
      </Modal>
    </PageContainer>
  );
}
