import { useQuery } from '@tanstack/react-query';
import { Award, CalendarDays, History, Lock, MapPin, MessageSquare, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LoadingState } from '../components/common/LoadingState';
import { authService } from '../features/auth/authService';
import { useAuthStore } from '../features/auth/authStore';

const recentTournaments = [
  { name: 'Apex Legends Global Series', game: 'Apex Legends', date: 'Oct 12, 2023', placement: '1st Place', prize: '$10,000' },
  { name: 'Valorant Challengers NA', game: 'Valorant', date: 'Sep 28, 2023', placement: '3rd Place', prize: '$2,500' },
  { name: 'CS2 Intel Extreme Masters', game: 'CS2', date: 'Aug 15, 2023', placement: '8th Place', prize: '-' },
];

export function PlayerProfilePage() {
  const fallbackUser = useAuthStore((state) => state.user);
  const profile = useQuery({ queryKey: ['profile-summary'], queryFn: authService.profileSummary });
  const user = profile.data?.user ?? fallbackUser;
  if (profile.isLoading && !user) return <LoadingState message="Loading profile..." />;

  const stats = profile.data ?? { matches: 1402, winRate: 68.4, tournamentsWon: 24, totalPrize: 45200, joinedYear: 2021 };
  return <div className="player-profile-page"><main className="player-profile-content"><section className="player-profile-primary"><article className="player-profile-hero"><div className="player-profile-avatar"><img src="/freefire-card.png" alt="Player avatar" /></div><div className="player-profile-intro"><h1>{user?.fullName ?? 'VoidWalker'} <span>✥</span> <em>LIVE</em></h1><p>FPS Specialist | Entry Fragger for <strong>Neon Syndicate</strong></p><div><span><MapPin /> NA East</span><span><CalendarDays /> Joined {stats.joinedYear}</span></div></div><div className="player-profile-actions"><button><UserPlus /> ADD FRIEND</button><button><MessageSquare /> MESSAGE</button></div></article><section className="player-profile-stats"><div><small>MATCHES</small><strong>{stats.matches.toLocaleString()}</strong></div><div><small>WIN RATE</small><strong>{stats.winRate}%</strong></div><div><small>TOURNEYS WON</small><strong>{stats.tournamentsWon}</strong></div><div><small>TOTAL PRIZE</small><strong>${stats.totalPrize.toLocaleString()}</strong></div></section><section className="player-profile-recent"><header><h2><History /> Recent Tournaments</h2><Link to="/matches">VIEW ALL →</Link></header><div className="player-profile-table__head"><span>TOURNAMENT</span><span>GAME</span><span>DATE</span><span>PLACEMENT</span><span>PRIZE</span></div>{recentTournaments.map((item) => <div className="player-profile-table__row" key={item.name}><strong><Award />{item.name}</strong><span>{item.game}</span><span>{item.date}</span><b className={item.placement === '1st Place' ? 'is-win' : ''}>{item.placement}</b><span>{item.prize}</span></div>)}</section></section><aside className="player-profile-sidebar"><section><small>CURRENT ROSTER</small><div className="player-profile-roster"><img src="/freefire-card.png" alt="Neon Syndicate" /><div><strong>Neon Syndicate</strong><span>Tier 1 Organization</span></div><button>›</button></div></section><section><small>BADGES & TITLES</small><div className="player-profile-badges"><Badge icon={<Award />} label="VETERAN" tone="purple" /><Badge icon={<Award />} label="ELITE" tone="green" /><Badge icon={<Award />} label="GRINDER" tone="red" /><Badge icon={<Lock />} label="LOCKED" tone="locked" /></div></section><section><small>MAIN TITLES</small><div className="player-profile-titles"><Title image="/efootball-card.png" name="Apex Legends" detail="980 HOURS | MASTER RANK" /><Title image="/ArenaHub%20-%20Games%20Discovery.png" name="Valorant" detail="420 HOURS | RADIANT" /></div></section></aside></main></div>;
}

function Badge({ icon, label, tone }: { icon: React.ReactNode; label: string; tone: string }) { return <div className={`player-profile-badge ${tone}`}>{icon}<span>{label}</span></div>; }
function Title({ image, name, detail }: { image: string; name: string; detail: string }) { return <div className="player-profile-title"><img src={image} alt="" /><span><strong>{name}</strong><small>{detail}</small></span></div>; }
