import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Trophy, Users, Flame, Crosshair, Plus, Filter } from 'lucide-react';

import { FilterBar } from '../components/freefire/FilterBar';
import { TournamentCard } from '../components/freefire/TournamentCard';
import {
  MOCK_UPCOMING, MOCK_ONGOING, MOCK_PAST, HERO_STATS,
  type FFTab, type FFMode, type FFEntryFee, type FFTournament,
} from '../components/freefire/mockData';

const HERO_BG = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1920';

export function FreeFirePage() {
  // Filter state
  const [tab, setTab] = useState<FFTab>('upcoming');
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<FFMode>('all');
  const [entryFee, setEntryFee] = useState<FFEntryFee>('all');

  // Derive the data pool for the active tab
  const pool: FFTournament[] = useMemo(() => {
    const src = tab === 'upcoming' ? MOCK_UPCOMING : tab === 'ongoing' ? MOCK_ONGOING : MOCK_PAST;

    return src.filter((t) => {
      // Search filter
      if (search) {
        const q = search.toLowerCase();
        if (!t.name.toLowerCase().includes(q) && !t.organizer.toLowerCase().includes(q)) return false;
      }
      // Mode filter
      if (mode !== 'all' && t.mode !== mode) return false;
      // Entry fee filter
      if (entryFee === 'free' && t.entryFee !== 0) return false;
      if (entryFee === 'paid' && t.entryFee === 0) return false;
      return true;
    });
  }, [tab, search, mode, entryFee]);

  return (
    <div className="w-full flex flex-col min-h-full">

      {/* ═══════════════════════════════════════════
          HERO BANNER
          ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden min-h-[320px] md:min-h-[380px] flex items-end">
        {/* Background artwork */}
        <img
          src={HERO_BG}
          alt="Free Fire Artwork"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        {/* Dark overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/80 to-[#0B0F19]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-transparent to-cyan-600/10" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 lg:px-8 pb-10 pt-8 space-y-5">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Games
          </Link>

          {/* Title block */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/25">
                <Crosshair className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-none">
                  Free Fire
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  Survival Shooter&nbsp; •&nbsp; Squad / Duo / Solo
                </p>
              </div>
            </div>
          </div>

          {/* Stats + CTA row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            {/* Stats pills */}
            <div className="flex flex-wrap gap-3">
              <StatPill
                icon={<Flame className="h-4 w-4 text-orange-400" />}
                value={HERO_STATS.activeTournaments}
                label="Active Tournaments"
              />
              <StatPill
                icon={<Trophy className="h-4 w-4 text-amber-400" />}
                value={HERO_STATS.totalPrizePool}
                label="Prize Pool"
              />
              <StatPill
                icon={<Users className="h-4 w-4 text-cyan-400" />}
                value={HERO_STATS.registeredPlayers.toLocaleString()}
                label="Players"
              />
            </div>

            {/* CTAs */}
            <div className="flex gap-3">
              <Link
                to="/teams"
                className="ff-btn ff-btn--primary text-sm"
              >
                <Plus className="h-4 w-4" /> Create Team
              </Link>
              <button
                onClick={() => document.getElementById('ff-filter-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="ff-btn ff-btn--ghost text-sm"
              >
                <Filter className="h-4 w-4" /> Filter
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FILTER BAR + TOURNAMENT GRID
          ═══════════════════════════════════════════ */}
      <section id="ff-filter-section" className="w-full max-w-7xl mx-auto px-5 lg:px-8 py-8 space-y-8">
        <FilterBar
          activeTab={tab}
          onTabChange={setTab}
          search={search}
          onSearchChange={setSearch}
          mode={mode}
          onModeChange={setMode}
          entryFee={entryFee}
          onEntryFeeChange={setEntryFee}
        />

        {/* Grid or empty state */}
        {pool.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pool.map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        ) : (
          <EmptyState tab={tab} />
        )}
      </section>
    </div>
  );
}

// ── Stat pill ──
function StatPill({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm px-4 py-2">
      {icon}
      <div className="leading-tight">
        <p className="text-sm font-bold text-white">{value}</p>
        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

// ── Empty state ──
function EmptyState({ tab }: { tab: FFTab }) {
  const messages: Record<FFTab, { title: string; desc: string }> = {
    upcoming: { title: 'No upcoming tournaments', desc: 'Check back later for new Free Fire competitions, or try adjusting your filters.' },
    ongoing:  { title: 'Nothing live right now',   desc: 'There are no Free Fire tournaments currently in progress.' },
    past:     { title: 'No past tournaments',      desc: 'Completed tournament results will appear here.' },
  };
  const m = messages[tab];
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/60 border border-slate-700/40 mb-5">
        <Trophy className="h-7 w-7 text-slate-600" />
      </div>
      <h3 className="text-lg font-bold text-white mb-1">{m.title}</h3>
      <p className="text-sm text-slate-500 max-w-sm">{m.desc}</p>
    </div>
  );
}
