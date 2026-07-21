import type { FFLeaderboardEntry } from './mockData';

interface LeaderboardTableProps {
  entries: FFLeaderboardEntry[];
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500">
        <p className="text-sm font-medium">No standings available yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-800/30">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700/50 text-left">
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 w-16">#</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Team</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Played</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Kills</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Placement</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-cyan-400 text-center">Total</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => {
            const isTop3 = e.rank <= 3;
            const rankColors: Record<number, string> = {
              1: 'text-amber-400',
              2: 'text-slate-300',
              3: 'text-orange-400',
            };
            return (
              <tr
                key={e.rank}
                className={`
                  border-b border-slate-700/30 transition-colors hover:bg-white/[0.02]
                  ${i % 2 === 0 ? 'bg-transparent' : 'bg-slate-800/20'}
                `}
              >
                <td className={`px-4 py-3 font-bold ${isTop3 ? rankColors[e.rank] : 'text-slate-500'}`}>
                  {e.rank}
                </td>
                <td className="px-4 py-3 font-semibold text-white">{e.team}</td>
                <td className="px-4 py-3 text-center text-slate-400">{e.matchesPlayed}</td>
                <td className="px-4 py-3 text-center text-slate-300">{e.kills}</td>
                <td className="px-4 py-3 text-center text-slate-300">{e.placementPoints}</td>
                <td className="px-4 py-3 text-center font-bold text-cyan-400">{e.totalPoints}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
