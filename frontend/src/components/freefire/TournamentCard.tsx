import { useState } from 'react';
import {
  Calendar, Users, Trophy, Crown, MapPin,
  Radio, Eye, ExternalLink, Flame,
} from 'lucide-react';
import type { FFTournament } from './mockData';
import { formatDateTime } from '../../utils/date';
import { RegistrationModal } from './RegistrationModal';

interface TournamentCardProps {
  tournament: FFTournament;
}

// ── Status badge config ──
const STATUS_CONFIG: Record<FFTournament['status'], { label: string; class: string; dot?: string }> = {
  REGISTRATION_OPEN: {
    label: 'Registration Open',
    class: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-emerald-500/20',
  },
  CLOSING_SOON: {
    label: 'Closing Soon',
    class: 'border-orange-500/30 bg-orange-500/10 text-orange-400 shadow-orange-500/20',
  },
  LIVE: {
    label: 'LIVE NOW',
    class: 'border-red-500/30 bg-red-500/10 text-red-400 shadow-red-500/20',
    dot: 'bg-red-500',
  },
  COMPLETED: {
    label: 'Completed',
    class: 'border-slate-600/30 bg-slate-700/20 text-slate-400',
  },
};

export function TournamentCard({ tournament }: TournamentCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'overview' | 'register' | 'leaderboard'>('overview');
  const badge = STATUS_CONFIG[tournament.status];

  const openModal = (tab: 'overview' | 'register' | 'leaderboard') => {
    setModalTab(tab);
    setModalOpen(true);
  };

  const slotPercent = Math.round((tournament.slotsFilled / tournament.slotsTotal) * 100);

  return (
    <>
      <article className="ff-card group">
        {/* Poster thumbnail */}
        <div className="relative h-40 overflow-hidden rounded-t-xl">
          <img
            src={tournament.posterUrl}
            alt={tournament.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/60 to-transparent" />

          {/* Status badge */}
          <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider shadow-sm ${badge.class}`}>
            {badge.dot && <span className={`h-1.5 w-1.5 rounded-full ${badge.dot} animate-pulse`} />}
            {badge.label}
          </span>

          {/* Prize pool badge */}
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-lg bg-amber-500/15 border border-amber-500/25 px-2.5 py-1 text-[11px] font-bold text-amber-400">
            <Trophy className="h-3 w-3" /> {tournament.prizePool}
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-5 gap-4">
          {/* Title & org */}
          <div>
            <h3 className="text-base font-bold text-white leading-snug line-clamp-2 group-hover:text-cyan-300 transition-colors">
              {tournament.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1">{tournament.organizer}</p>
          </div>

          {/* ──── Card body by status ──── */}

          {/* A. Upcoming card body */}
          {(tournament.status === 'REGISTRATION_OPEN' || tournament.status === 'CLOSING_SOON') && (
            <div className="space-y-3 flex-1">
              {/* Metadata grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <MetaItem icon={<Flame className="h-3.5 w-3.5 text-orange-400" />} label={tournament.format} />
                <MetaItem icon={<Calendar className="h-3.5 w-3.5 text-cyan-400" />} label={formatDateTime(tournament.startsAt)} />
              </div>

              {/* Slot progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Slots</span>
                  <span className="text-white font-semibold">{tournament.slotsFilled} / {tournament.slotsTotal}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-700/60 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      slotPercent >= 90 ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,.4)]' : 'bg-cyan-500 shadow-[0_0_8px_rgba(0,240,255,.3)]'
                    }`}
                    style={{ width: `${slotPercent}%` }}
                  />
                </div>
              </div>

              {/* Entry fee */}
              {tournament.entryFee === 0 ? (
                <span className="inline-block rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-400">FREE ENTRY</span>
              ) : (
                <span className="inline-block rounded-md bg-slate-700/40 border border-slate-600/30 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
                  Entry: {tournament.currency} {tournament.entryFee}
                </span>
              )}
            </div>
          )}

          {/* B. Ongoing / Live card body */}
          {tournament.status === 'LIVE' && (
            <div className="space-y-3 flex-1">
              {tournament.currentRound && tournament.currentMatch && (
                <div className="rounded-lg bg-red-500/[0.07] border border-red-500/20 p-3">
                  <p className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Radio className="h-3.5 w-3.5 animate-pulse" /> Live Progress
                  </p>
                  <p className="text-sm text-white font-semibold mt-1">{tournament.currentRound} — {tournament.currentMatch}</p>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                Maps: <span className="text-slate-200 font-medium">{tournament.maps.join(' • ')}</span>
              </div>
            </div>
          )}

          {/* C. Completed card body */}
          {tournament.status === 'COMPLETED' && (
            <div className="space-y-3 flex-1">
              <div className="text-xs text-slate-500">
                {formatDateTime(tournament.startsAt)} — {tournament.endsAt ? formatDateTime(tournament.endsAt) : 'N/A'}
              </div>
              {tournament.winnerTeam && (
                <div className="flex items-center gap-2 rounded-lg bg-amber-500/[0.07] border border-amber-500/20 px-3 py-2.5">
                  <Crown className="h-4 w-4 text-amber-400 shrink-0" />
                  <span className="text-sm font-bold text-amber-300">{tournament.winnerTeam}</span>
                </div>
              )}
            </div>
          )}

          {/* ── Action buttons ── */}
          <div className="flex gap-2 pt-1">
            {/* Upcoming */}
            {(tournament.status === 'REGISTRATION_OPEN' || tournament.status === 'CLOSING_SOON') && (
              <>
                <button
                  onClick={() => openModal('overview')}
                  className="ff-btn ff-btn--primary flex-1"
                >
                  Register Team
                </button>
                <button
                  onClick={() => openModal('overview')}
                  className="ff-btn ff-btn--ghost"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Live */}
            {tournament.status === 'LIVE' && (
              <>
                <button
                  onClick={() => openModal('leaderboard')}
                  className="ff-btn ff-btn--primary flex-1"
                >
                  Live Standings
                </button>
                {tournament.streamUrl && (
                  <a
                    href={tournament.streamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ff-btn ff-btn--ghost"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </>
            )}

            {/* Completed */}
            {tournament.status === 'COMPLETED' && (
              <button
                onClick={() => openModal('leaderboard')}
                className="ff-btn ff-btn--secondary flex-1"
              >
                View Leaderboard
              </button>
            )}
          </div>
        </div>
      </article>

      {/* Modal */}
      {modalOpen && (
        <RegistrationModal
          tournament={tournament}
          initialTab={modalTab}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

// ── Small helper ──
function MetaItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-slate-300 truncate">
      {icon}
      <span className="truncate">{label}</span>
    </span>
  );
}
