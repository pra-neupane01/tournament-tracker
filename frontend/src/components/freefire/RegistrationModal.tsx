import { useState } from 'react';
import {
  X, ChevronDown, ChevronRight, CheckSquare, Square, Upload,
  Calendar, MapPin, Clock, FileText,
} from 'lucide-react';
import type { FFTournament, FFMatch } from './mockData';
import { LeaderboardTable } from './LeaderboardTable';
import { formatDateTime } from '../../utils/date';

type ModalTab = 'overview' | 'register' | 'leaderboard';

interface RegistrationModalProps {
  tournament: FFTournament;
  initialTab?: ModalTab;
  onClose: () => void;
}

// ── Mock teams the player owns (would come from API) ──
const MY_TEAMS = [
  { id: 'team-1', name: 'Team Viper' },
  { id: 'team-2', name: 'Phoenix Rising' },
];

export function RegistrationModal({ tournament, initialTab = 'overview', onClose }: RegistrationModalProps) {
  const [tab, setTab] = useState<ModalTab>(initialTab);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [expandedRule, setExpandedRule] = useState<number | null>(null);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [matchTab, setMatchTab] = useState('overall');

  // Form fields (mock)
  const [formData, setFormData] = useState({
    captainUid: '', player2Uid: '', player3Uid: '', player4Uid: '',
    captainIgn: '', player2Ign: '', player3Ign: '', player4Ign: '',
  });

  const isUpcoming = tournament.status === 'REGISTRATION_OPEN' || tournament.status === 'CLOSING_SOON';
  const tabs: { key: ModalTab; label: string; show: boolean }[] = [
    { key: 'overview',    label: 'Overview & Rules', show: true },
    { key: 'register',    label: 'Register Team',    show: isUpcoming },
    { key: 'leaderboard', label: 'Standings',         show: tournament.leaderboard.length > 0 },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Would call registration API
    alert('Registration submitted! (Mock)');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-8 sm:pt-16 px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-slate-700/60 bg-[#0d1220] shadow-2xl shadow-black/50 animate-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/50 px-6 py-4 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">{tournament.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{tournament.organizer}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-slate-700/50 px-6 shrink-0">
          {tabs.filter(t => t.show).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`
                relative py-3 px-4 text-sm font-semibold transition-colors
                ${tab === t.key ? 'text-white' : 'text-slate-500 hover:text-slate-300'}
              `}
            >
              {t.label}
              {tab === t.key && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,.5)]" />
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ═══ Tab 1: Overview & Rules ═══ */}
          {tab === 'overview' && (
            <>
              {/* Quick info grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <InfoTile icon={<Calendar className="h-4 w-4" />} label="Date" value={formatDateTime(tournament.startsAt)} />
                <InfoTile icon={<MapPin className="h-4 w-4" />} label="Maps" value={tournament.maps.join(', ')} />
                <InfoTile icon={<Clock className="h-4 w-4" />} label="Room ID" value="15 min before match" />
              </div>

              {/* Format & prize */}
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 text-xs font-semibold text-cyan-400">
                  <FileText className="h-3.5 w-3.5" /> {tournament.format}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-400">
                  🏆 {tournament.prizePool}
                </span>
                {tournament.entryFee > 0 && (
                  <span className="inline-flex items-center rounded-lg bg-slate-700/40 border border-slate-600/30 px-3 py-1.5 text-xs font-semibold text-slate-300">
                    Entry: {tournament.currency} {tournament.entryFee}
                  </span>
                )}
              </div>

              {/* Rules accordion */}
              {tournament.rules.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-white">Official Rules</h3>
                  {tournament.rules.map((rule, i) => (
                    <div key={i} className="rounded-xl border border-slate-700/40 bg-slate-800/30 overflow-hidden">
                      <button
                        onClick={() => setExpandedRule(expandedRule === i ? null : i)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-200 hover:bg-white/[0.02] transition-colors"
                      >
                        {rule.title}
                        {expandedRule === i
                          ? <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
                          : <ChevronRight className="h-4 w-4 text-slate-500 shrink-0" />}
                      </button>
                      {expandedRule === i && (
                        <div className="px-4 pb-4 text-sm text-slate-400 leading-relaxed border-t border-slate-700/30 pt-3">
                          {rule.content}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Rule acceptance (only for upcoming) */}
              {isUpcoming && (
                <button
                  onClick={() => setRulesAccepted(!rulesAccepted)}
                  className="flex items-start gap-3 rounded-xl border border-slate-700/40 bg-slate-800/20 p-4 text-left transition-colors hover:bg-slate-800/40 w-full"
                >
                  {rulesAccepted
                    ? <CheckSquare className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                    : <Square className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />}
                  <span className="text-sm text-slate-300">
                    I have read and agree to all tournament rules. <span className="text-slate-500">(Required to register)</span>
                  </span>
                </button>
              )}

              {/* CTA to go to register tab */}
              {isUpcoming && (
                <button
                  onClick={() => { if (rulesAccepted) setTab('register'); }}
                  disabled={!rulesAccepted}
                  className={`
                    w-full rounded-xl py-3 text-sm font-bold tracking-wide transition-all duration-300
                    ${rulesAccepted
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:brightness-110 active:scale-[0.98]'
                      : 'bg-slate-700/40 text-slate-500 cursor-not-allowed'}
                  `}
                >
                  {rulesAccepted ? 'Proceed to Registration →' : 'Accept rules to continue'}
                </button>
              )}
            </>
          )}

          {/* ═══ Tab 2: Register Team ═══ */}
          {tab === 'register' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Select team */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Select Your Team</label>
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-700/60 bg-slate-800/40 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
                >
                  <option value="">Choose a team...</option>
                  {MY_TEAMS.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Captain auto-fill */}
              <div className="rounded-xl border border-slate-700/40 bg-slate-800/20 p-4 space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Captain Details (auto-filled)</p>
                <p className="text-sm text-white">Yojan Neupane</p>
                <p className="text-xs text-slate-400">yojan@arenahub.gg • Discord: yojan#1234</p>
              </div>

              {/* Player UIDs */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-300">Free Fire Player UIDs</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(['captainUid', 'player2Uid', 'player3Uid', 'player4Uid'] as const).map((field, i) => (
                    <input
                      key={field}
                      type="text"
                      placeholder={i === 0 ? 'Captain UID' : `Player ${i + 1} UID`}
                      value={formData[field]}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      required
                      className="rounded-xl border border-slate-700/60 bg-slate-800/40 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/50"
                    />
                  ))}
                </div>
              </div>

              {/* IGNs */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-300">In-Game Names (IGN)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(['captainIgn', 'player2Ign', 'player3Ign', 'player4Ign'] as const).map((field, i) => (
                    <input
                      key={field}
                      type="text"
                      placeholder={i === 0 ? 'Captain IGN' : `Player ${i + 1} IGN`}
                      value={formData[field]}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      required
                      className="rounded-xl border border-slate-700/60 bg-slate-800/40 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/50"
                    />
                  ))}
                </div>
              </div>

              {/* File upload (Student ID) */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-300">Student ID (if required)</h4>
                <label className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-700/50 bg-slate-800/20 p-6 cursor-pointer hover:border-cyan-500/30 hover:bg-slate-800/40 transition-colors">
                  <Upload className="h-8 w-8 text-slate-500" />
                  <span className="text-sm text-slate-400">Drag & drop or click to upload</span>
                  <span className="text-xs text-slate-600">PNG, JPG up to 5MB</span>
                  <input type="file" accept="image/*" className="hidden" />
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:brightness-110 active:scale-[0.98] transition-all duration-300"
              >
                Submit Registration
              </button>
            </form>
          )}

          {/* ═══ Tab 3: Standings & Schedule ═══ */}
          {tab === 'leaderboard' && (
            <div className="space-y-5">
              {/* Match schedule quick view */}
              {tournament.matchSchedule.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-white">Match Schedule</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setMatchTab('overall')}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        matchTab === 'overall'
                          ? 'bg-cyan-500/15 text-cyan-400'
                          : 'text-slate-400 hover:text-white bg-slate-800/40'
                      }`}
                    >
                      Overall
                    </button>
                    {tournament.matchSchedule.map((m: FFMatch) => (
                      <button
                        key={m.id}
                        onClick={() => setMatchTab(m.id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 ${
                          matchTab === m.id
                            ? 'bg-cyan-500/15 text-cyan-400'
                            : 'text-slate-400 hover:text-white bg-slate-800/40'
                        }`}
                      >
                        {m.status === 'live' && <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />}
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {/* If a specific match is selected, show its info */}
                  {matchTab !== 'overall' && (() => {
                    const match = tournament.matchSchedule.find(m => m.id === matchTab);
                    if (!match) return null;
                    return (
                      <div className="flex items-center gap-4 rounded-xl border border-slate-700/40 bg-slate-800/20 p-3 text-sm">
                        <span className="text-slate-300"><MapPin className="inline h-3.5 w-3.5 mr-1 text-slate-500" />{match.map}</span>
                        <span className="text-slate-300"><Clock className="inline h-3.5 w-3.5 mr-1 text-slate-500" />{formatDateTime(match.time)}</span>
                        <StatusDot status={match.status} />
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Leaderboard table */}
              <LeaderboardTable entries={tournament.leaderboard} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Small helpers ──

function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-700/40 bg-slate-800/20 p-3 space-y-1">
      <div className="flex items-center gap-1.5 text-slate-500">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm text-white font-medium truncate">{value}</p>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const config: Record<string, { color: string; label: string }> = {
    upcoming:  { color: 'bg-slate-500', label: 'Upcoming' },
    live:      { color: 'bg-red-500 animate-pulse', label: 'Live' },
    completed: { color: 'bg-emerald-500', label: 'Done' },
  };
  const c = config[status] ?? config.upcoming;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
      <span className={`h-1.5 w-1.5 rounded-full ${c.color}`} />
      {c.label}
    </span>
  );
}
