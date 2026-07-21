// ── Free Fire–specific display types (extend backend Tournament for UI) ──

export type FFTab = 'upcoming' | 'ongoing' | 'past';
export type FFMode = 'all' | 'squad' | 'duo' | 'solo';
export type FFEntryFee = 'all' | 'free' | 'paid';

export interface FFTournament {
  id: string;
  name: string;
  organizer: string;
  status: 'REGISTRATION_OPEN' | 'CLOSING_SOON' | 'LIVE' | 'COMPLETED';
  format: string;          // e.g. "Squad Battle Royale"
  mode: 'squad' | 'duo' | 'solo';
  entryFee: number;        // 0 = free
  prizePool: string;       // display string
  currency: string;
  startsAt: string;        // ISO
  endsAt: string | null;
  slotsTotal: number;
  slotsFilled: number;
  posterUrl: string;
  maps: string[];
  // Ongoing-specific
  currentRound?: string;
  currentMatch?: string;
  streamUrl?: string;
  // Completed-specific
  winnerTeam?: string;
  winnerLogo?: string;
  // Rules
  rules: { title: string; content: string }[];
  // Leaderboard
  leaderboard: FFLeaderboardEntry[];
  matchSchedule: FFMatch[];
}

export interface FFLeaderboardEntry {
  rank: number;
  team: string;
  logo?: string;
  matchesPlayed: number;
  kills: number;
  placementPoints: number;
  totalPoints: number;
}

export interface FFMatch {
  id: string;
  label: string;       // "Match 1", "Match 2"
  map: string;
  time: string;        // ISO or display string
  status: 'upcoming' | 'live' | 'completed';
}

// ── Placement point table (Free Fire scoring) ──
export const FF_PLACEMENT_POINTS: Record<number, number> = {
  1: 12, 2: 9, 3: 8, 4: 7, 5: 6, 6: 5,
  7: 4, 8: 3, 9: 2, 10: 1, 11: 0, 12: 0,
};

// ── Hero stats ──
export const HERO_STATS = {
  activeTournaments: 8,
  totalPrizePool: 'NPR 1,25,000',
  registeredPlayers: 1240,
};

// ── Poster images (Unsplash — gaming / battle royale themed) ──
const POSTERS = [
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1538481199005-27dec2909f41?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1518605368461-1f12523b0542?auto=format&fit=crop&q=80&w=800',
];

// ── Mock Data ──

export const MOCK_UPCOMING: FFTournament[] = [
  {
    id: 'ff-t1',
    name: 'Garena Free Fire Cup Season 5',
    organizer: 'ArenaHub Esports',
    status: 'REGISTRATION_OPEN',
    format: 'Squad Battle Royale',
    mode: 'squad',
    entryFee: 0,
    prizePool: 'NPR 50,000',
    currency: 'NPR',
    startsAt: '2026-10-24T12:15:00Z',
    endsAt: '2026-10-26T18:00:00Z',
    slotsTotal: 12,
    slotsFilled: 7,
    posterUrl: POSTERS[0],
    maps: ['Bermuda', 'Purgatory', 'Kalahari'],
    rules: [
      { title: 'General Conduct', content: 'All participants must maintain sportsmanship throughout the tournament. Any form of toxicity, harassment, or unsporting behavior will result in immediate disqualification.' },
      { title: 'Device & Emulator Policy', content: 'Only mobile devices are allowed. Emulators, controllers, and trigger attachments are strictly prohibited.' },
      { title: 'Roster Lock', content: 'Teams must finalize their 4-player roster before registration closes. No substitutions allowed after the roster lock deadline.' },
      { title: 'Match Rules', content: 'Classic Battle Royale mode — Squad. Room ID will be shared 15 minutes before each match. Players must join within 5 minutes or face disqualification.' },
      { title: 'Scoring System', content: 'Kill Points: 1 point per kill. Placement Points: 1st = 12, 2nd = 9, 3rd = 8, 4th = 7, 5th = 6, 6th = 5, 7th = 4, 8th = 3, 9th = 2, 10th = 1.' },
    ],
    leaderboard: [],
    matchSchedule: [
      { id: 'm1', label: 'Match 1', map: 'Bermuda', time: '2026-10-24T12:15:00Z', status: 'upcoming' },
      { id: 'm2', label: 'Match 2', map: 'Purgatory', time: '2026-10-24T13:00:00Z', status: 'upcoming' },
      { id: 'm3', label: 'Match 3', map: 'Kalahari', time: '2026-10-24T14:00:00Z', status: 'upcoming' },
      { id: 'm4', label: 'Match 4', map: 'Bermuda', time: '2026-10-25T12:15:00Z', status: 'upcoming' },
      { id: 'm5', label: 'Match 5', map: 'Purgatory', time: '2026-10-25T13:00:00Z', status: 'upcoming' },
      { id: 'm6', label: 'Match 6', map: 'Kalahari', time: '2026-10-25T14:00:00Z', status: 'upcoming' },
    ],
  },
  {
    id: 'ff-t2',
    name: 'College Clash — Free Fire Edition',
    organizer: 'KU Esports Club',
    status: 'CLOSING_SOON',
    format: 'Duo Battle Royale',
    mode: 'duo',
    entryFee: 200,
    prizePool: 'NPR 15,000',
    currency: 'NPR',
    startsAt: '2026-10-28T10:30:00Z',
    endsAt: '2026-10-28T17:00:00Z',
    slotsTotal: 24,
    slotsFilled: 22,
    posterUrl: POSTERS[1],
    maps: ['Bermuda', 'Alpine'],
    rules: [
      { title: 'Eligibility', content: 'Open only to students currently enrolled in colleges within Nepal. Student ID verification is mandatory during registration.' },
      { title: 'Device Policy', content: 'Mobile devices only. No emulators, triggers, or external accessories.' },
      { title: 'Match Format', content: '4 matches total. Duo Classic mode. Top teams based on cumulative points advance to finals.' },
    ],
    leaderboard: [],
    matchSchedule: [
      { id: 'm1', label: 'Match 1', map: 'Bermuda', time: '2026-10-28T10:30:00Z', status: 'upcoming' },
      { id: 'm2', label: 'Match 2', map: 'Alpine', time: '2026-10-28T11:30:00Z', status: 'upcoming' },
      { id: 'm3', label: 'Match 3', map: 'Bermuda', time: '2026-10-28T13:00:00Z', status: 'upcoming' },
      { id: 'm4', label: 'Match 4', map: 'Alpine', time: '2026-10-28T14:00:00Z', status: 'upcoming' },
    ],
  },
  {
    id: 'ff-t3',
    name: 'Solo Showdown — Weekly #12',
    organizer: 'Nepal Esports League',
    status: 'REGISTRATION_OPEN',
    format: 'Solo Battle Royale',
    mode: 'solo',
    entryFee: 0,
    prizePool: 'NPR 5,000',
    currency: 'NPR',
    startsAt: '2026-11-01T14:00:00Z',
    endsAt: '2026-11-01T17:00:00Z',
    slotsTotal: 48,
    slotsFilled: 31,
    posterUrl: POSTERS[2],
    maps: ['Bermuda'],
    rules: [
      { title: 'Format', content: 'Solo Classic Battle Royale. 3 matches total.' },
      { title: 'Scoring', content: 'Standard Free Fire scoring: 1 pt per kill + placement points.' },
    ],
    leaderboard: [],
    matchSchedule: [
      { id: 'm1', label: 'Match 1', map: 'Bermuda', time: '2026-11-01T14:00:00Z', status: 'upcoming' },
      { id: 'm2', label: 'Match 2', map: 'Bermuda', time: '2026-11-01T15:00:00Z', status: 'upcoming' },
      { id: 'm3', label: 'Match 3', map: 'Bermuda', time: '2026-11-01T16:00:00Z', status: 'upcoming' },
    ],
  },
];

export const MOCK_ONGOING: FFTournament[] = [
  {
    id: 'ff-t4',
    name: 'Nepal Pro League — Free Fire S2',
    organizer: 'ArenaHub Esports',
    status: 'LIVE',
    format: 'Squad Battle Royale',
    mode: 'squad',
    entryFee: 500,
    prizePool: 'NPR 75,000',
    currency: 'NPR',
    startsAt: '2026-10-20T11:00:00Z',
    endsAt: '2026-10-22T18:00:00Z',
    slotsTotal: 12,
    slotsFilled: 12,
    posterUrl: POSTERS[3],
    maps: ['Bermuda', 'Purgatory', 'Kalahari'],
    currentRound: 'Round 2',
    currentMatch: 'Match 3 of 6',
    streamUrl: 'https://youtube.com/live/example',
    rules: [],
    leaderboard: [
      { rank: 1, team: 'Team Viper',     matchesPlayed: 3, kills: 28, placementPoints: 29, totalPoints: 57 },
      { rank: 2, team: 'Phoenix Rising',  matchesPlayed: 3, kills: 24, placementPoints: 25, totalPoints: 49 },
      { rank: 3, team: 'Shadow Wolves',   matchesPlayed: 3, kills: 22, placementPoints: 22, totalPoints: 44 },
      { rank: 4, team: 'Blaze Squad',     matchesPlayed: 3, kills: 19, placementPoints: 21, totalPoints: 40 },
      { rank: 5, team: 'Dark Knights',    matchesPlayed: 3, kills: 18, placementPoints: 18, totalPoints: 36 },
      { rank: 6, team: 'Kathmandu Elite', matchesPlayed: 3, kills: 15, placementPoints: 17, totalPoints: 32 },
      { rank: 7, team: 'Royal Tigers',    matchesPlayed: 3, kills: 14, placementPoints: 14, totalPoints: 28 },
      { rank: 8, team: 'Storm Breakers',  matchesPlayed: 3, kills: 12, placementPoints: 12, totalPoints: 24 },
      { rank: 9, team: 'Eagle Eye',       matchesPlayed: 2, kills: 10, placementPoints: 11, totalPoints: 21 },
      { rank: 10, team: 'Frost Byte',     matchesPlayed: 2, kills: 8,  placementPoints: 10, totalPoints: 18 },
      { rank: 11, team: 'Night Stalkers', matchesPlayed: 2, kills: 7,  placementPoints: 7,  totalPoints: 14 },
      { rank: 12, team: 'Wild Cards',     matchesPlayed: 2, kills: 5,  placementPoints: 5,  totalPoints: 10 },
    ],
    matchSchedule: [
      { id: 'm1', label: 'Match 1', map: 'Bermuda',   time: '2026-10-20T11:00:00Z', status: 'completed' },
      { id: 'm2', label: 'Match 2', map: 'Purgatory', time: '2026-10-20T12:00:00Z', status: 'completed' },
      { id: 'm3', label: 'Match 3', map: 'Kalahari',  time: '2026-10-21T11:00:00Z', status: 'live' },
      { id: 'm4', label: 'Match 4', map: 'Bermuda',   time: '2026-10-21T12:00:00Z', status: 'upcoming' },
      { id: 'm5', label: 'Match 5', map: 'Purgatory', time: '2026-10-22T11:00:00Z', status: 'upcoming' },
      { id: 'm6', label: 'Match 6', map: 'Kalahari',  time: '2026-10-22T12:00:00Z', status: 'upcoming' },
    ],
  },
];

export const MOCK_PAST: FFTournament[] = [
  {
    id: 'ff-t5',
    name: 'ArenaHub Invitational — FF Championship',
    organizer: 'ArenaHub Esports',
    status: 'COMPLETED',
    format: 'Squad Battle Royale',
    mode: 'squad',
    entryFee: 1000,
    prizePool: 'NPR 1,00,000',
    currency: 'NPR',
    startsAt: '2026-09-14T10:00:00Z',
    endsAt: '2026-09-16T18:00:00Z',
    slotsTotal: 16,
    slotsFilled: 16,
    posterUrl: POSTERS[0],
    maps: ['Bermuda', 'Purgatory', 'Kalahari'],
    winnerTeam: 'Team Viper',
    rules: [],
    leaderboard: [
      { rank: 1, team: 'Team Viper',      matchesPlayed: 6, kills: 52, placementPoints: 58, totalPoints: 110 },
      { rank: 2, team: 'Phoenix Rising',   matchesPlayed: 6, kills: 45, placementPoints: 48, totalPoints: 93 },
      { rank: 3, team: 'Shadow Wolves',    matchesPlayed: 6, kills: 40, placementPoints: 42, totalPoints: 82 },
      { rank: 4, team: 'Blaze Squad',      matchesPlayed: 6, kills: 38, placementPoints: 38, totalPoints: 76 },
      { rank: 5, team: 'Dark Knights',     matchesPlayed: 6, kills: 35, placementPoints: 34, totalPoints: 69 },
      { rank: 6, team: 'Kathmandu Elite',  matchesPlayed: 6, kills: 30, placementPoints: 30, totalPoints: 60 },
    ],
    matchSchedule: [
      { id: 'm1', label: 'Match 1', map: 'Bermuda',   time: '2026-09-14T10:00:00Z', status: 'completed' },
      { id: 'm2', label: 'Match 2', map: 'Purgatory', time: '2026-09-14T11:00:00Z', status: 'completed' },
      { id: 'm3', label: 'Match 3', map: 'Kalahari',  time: '2026-09-14T12:00:00Z', status: 'completed' },
      { id: 'm4', label: 'Match 4', map: 'Bermuda',   time: '2026-09-15T10:00:00Z', status: 'completed' },
      { id: 'm5', label: 'Match 5', map: 'Purgatory', time: '2026-09-15T11:00:00Z', status: 'completed' },
      { id: 'm6', label: 'Match 6', map: 'Kalahari',  time: '2026-09-15T12:00:00Z', status: 'completed' },
    ],
  },
  {
    id: 'ff-t6',
    name: 'Weekend Warriors — Solo Rush',
    organizer: 'Nepal Esports League',
    status: 'COMPLETED',
    format: 'Solo Battle Royale',
    mode: 'solo',
    entryFee: 0,
    prizePool: 'NPR 3,000',
    currency: 'NPR',
    startsAt: '2026-09-21T14:00:00Z',
    endsAt: '2026-09-21T17:00:00Z',
    slotsTotal: 48,
    slotsFilled: 48,
    posterUrl: POSTERS[2],
    maps: ['Bermuda'],
    winnerTeam: 'xDraGoN',
    rules: [],
    leaderboard: [
      { rank: 1, team: 'xDraGoN',    matchesPlayed: 3, kills: 18, placementPoints: 33, totalPoints: 51 },
      { rank: 2, team: 'ShadowFF',   matchesPlayed: 3, kills: 15, placementPoints: 25, totalPoints: 40 },
      { rank: 3, team: 'FireStorm',  matchesPlayed: 3, kills: 14, placementPoints: 22, totalPoints: 36 },
    ],
    matchSchedule: [],
  },
];
