import { Search, SlidersHorizontal } from 'lucide-react';
import type { FFTab, FFMode, FFEntryFee } from './mockData';

interface FilterBarProps {
  activeTab: FFTab;
  onTabChange: (tab: FFTab) => void;
  search: string;
  onSearchChange: (v: string) => void;
  mode: FFMode;
  onModeChange: (m: FFMode) => void;
  entryFee: FFEntryFee;
  onEntryFeeChange: (f: FFEntryFee) => void;
}

const TABS: { key: FFTab; label: string; dot?: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'ongoing',  label: 'Ongoing / Live', dot: 'bg-red-500' },
  { key: 'past',     label: 'Past / Completed' },
];

const MODES: { key: FFMode; label: string }[] = [
  { key: 'all',   label: 'All' },
  { key: 'squad', label: 'Squad' },
  { key: 'duo',   label: 'Duo' },
  { key: 'solo',  label: 'Solo' },
];

const FEES: { key: FFEntryFee; label: string }[] = [
  { key: 'all',  label: 'All' },
  { key: 'free', label: 'Free' },
  { key: 'paid', label: 'Paid' },
];

export function FilterBar({
  activeTab, onTabChange,
  search, onSearchChange,
  mode, onModeChange,
  entryFee, onEntryFeeChange,
}: FilterBarProps) {
  return (
    <div className="space-y-5">
      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 rounded-xl bg-slate-800/50 p-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => onTabChange(t.key)}
            className={`
              relative flex items-center gap-2 whitespace-nowrap rounded-lg px-5 py-2.5
              text-sm font-semibold tracking-wide transition-all duration-250
              ${activeTab === t.key
                ? 'bg-[#0B0F19] text-white shadow-lg shadow-black/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}
            `}
          >
            {t.dot && activeTab === t.key && (
              <span className={`h-2 w-2 rounded-full ${t.dot} animate-pulse`} />
            )}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Controls row ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by tournament or organizer..."
            className="
              w-full rounded-xl border border-slate-700/60 bg-slate-800/40
              py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500
              outline-none transition-colors focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20
            "
          />
        </div>

        {/* Mode pills */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-800/40 p-1 border border-slate-700/40">
          <SlidersHorizontal className="h-4 w-4 text-slate-500 mx-2 shrink-0" />
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => onModeChange(m.key)}
              className={`
                rounded-md px-3 py-1.5 text-xs font-semibold transition-all
                ${mode === m.key
                  ? 'bg-cyan-500/15 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'}
              `}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Entry fee pills */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-800/40 p-1 border border-slate-700/40">
          {FEES.map((f) => (
            <button
              key={f.key}
              onClick={() => onEntryFeeChange(f.key)}
              className={`
                rounded-md px-3 py-1.5 text-xs font-semibold transition-all
                ${entryFee === f.key
                  ? 'bg-orange-500/15 text-orange-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'}
              `}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
