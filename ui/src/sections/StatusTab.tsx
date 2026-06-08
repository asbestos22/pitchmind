import { trpc } from '@/providers/trpc';
import { useAuth } from '@/hooks/useAuth';
import { Trophy, Target, Flame, TrendingUp, User, AlertCircle } from 'lucide-react';

export default function StatusTab() {
  const { user, isAuthenticated } = useAuth();
  const { data: myPredictions } = trpc.prediction.myPredictions.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const { data: allPredictions } = trpc.prediction.list.useQuery();
  const { data: allRoasts } = trpc.roast.list.useQuery();
  const { data: matches } = trpc.match.list.useQuery();

  // Calculate stats
  const totalPicks = myPredictions?.length || 0;
  const totalPoints = myPredictions?.reduce((sum, p) => sum + (p.points || 0), 0) || 0;
  const avgPoints = totalPicks > 0 ? (totalPoints / totalPicks).toFixed(1) : '0';
  const myRoasts = allRoasts?.filter(r => r.userId === user?.id).length || 0;

  // Leaderboard: aggregate points by user
  const leaderboard = allPredictions
    ? Object.values(
        allPredictions.reduce((acc, pred) => {
          const key = pred.userId;
          if (!acc[key]) {
            acc[key] = { userId: key, userName: pred.userName, totalPoints: 0, totalPicks: 0 };
          }
          acc[key].totalPoints += pred.points || 0;
          acc[key].totalPicks += 1;
          return acc;
        }, {} as Record<number, { userId: number; userName: string; totalPoints: number; totalPicks: number }>)
      ).sort((a, b) => b.totalPoints - a.totalPoints)
    : [];

  const myRank = leaderboard.findIndex(u => u.userId === user?.id) + 1;

  if (!isAuthenticated) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3">
        <AlertCircle size={24} className="text-[var(--accent)]" />
        <p className="text-[10px] font-bold text-[var(--panel-light)]">SIGN IN TO VIEW YOUR STATUS</p>
        <p className="text-[9px] text-[var(--text-muted)]">Track your predictions and climb the leaderboard</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* User Profile Card */}
      <div className="flex-shrink-0 p-4 border-b border-[var(--panel-mid)]">
        <div className="glow-border-strong data-panel rounded p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-soft)] flex items-center justify-center">
              <User size={18} className="text-[var(--panel-dark)]" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white">{user?.name}</h2>
              <p className="text-[9px] text-[var(--text-muted)] font-semibold">PREDICTOR #{user?.id}</p>
            </div>
            {myRank > 0 && (
              <div className="ml-auto flex flex-col items-center">
                <span className="text-[8px] text-[var(--text-muted)] font-bold">RANK</span>
                <span className="text-lg font-black text-[var(--accent-soft)] glow-text">#{myRank}</span>
              </div>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-2">
            <div className="flex flex-col items-center p-2 bg-[rgba(212,160,23,0.08)] rounded">
              <Target size={12} className="text-[var(--accent)] mb-1" />
              <span className="text-lg font-black text-white">{totalPicks}</span>
              <span className="text-[7px] font-bold text-[var(--text-muted)]">PICKS</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-[rgba(212,160,23,0.08)] rounded">
              <Trophy size={12} className="text-[var(--accent)] mb-1" />
              <span className="text-lg font-black text-[var(--accent-soft)] glow-text">{totalPoints}</span>
              <span className="text-[7px] font-bold text-[var(--text-muted)]">PTS</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-[rgba(212,160,23,0.08)] rounded">
              <TrendingUp size={12} className="text-[var(--accent)] mb-1" />
              <span className="text-lg font-black text-white">{avgPoints}</span>
              <span className="text-[7px] font-bold text-[var(--text-muted)]">AVG</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-[rgba(212,160,23,0.08)] rounded">
              <Flame size={12} className="text-[var(--accent)] mb-1" />
              <span className="text-lg font-black text-white">{myRoasts}</span>
              <span className="text-[7px] font-bold text-[var(--text-muted)]">ROASTS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border-b border-[var(--panel-mid)]">
          <Trophy size={12} className="text-[var(--accent)]" />
          <span className="text-[10px] font-black text-[var(--panel-light)] tracking-[0.1em]">LEADERBOARD</span>
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll p-3 space-y-1">
          {leaderboard.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 gap-2">
              <Trophy size={16} className="text-[var(--text-muted)]" />
              <span className="text-[9px] font-bold text-[var(--text-muted)]">NO SCORES YET</span>
            </div>
          ) : (
            leaderboard.map((entry, idx) => {
              const isMe = entry.userId === user?.id;
              return (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-3 p-2 rounded transition-all ${
                    isMe
                      ? 'bg-[rgba(212,160,23,0.15)] border border-[var(--accent)]'
                      : 'hover:bg-[rgba(212,160,23,0.05)]'
                  }`}
                >
                  {/* Rank */}
                  <div className={`w-6 h-6 flex items-center justify-center rounded text-[10px] font-black ${
                    idx === 0 ? 'bg-[var(--accent)] text-[var(--panel-dark)]' :
                    idx === 1 ? 'bg-[var(--panel-mid)] text-[var(--accent-soft)]' :
                    idx === 2 ? 'bg-[rgba(212,160,23,0.2)] text-[var(--accent)]' :
                    'text-[var(--text-muted)]'
                  }`}>
                    {idx + 1}
                  </div>

                  {/* Name */}
                  <div className="flex-1">
                    <span className={`text-[10px] font-bold ${isMe ? 'text-[var(--accent-soft)]' : 'text-white'}`}>
                      {entry.userName}
                      {isMe && <span className="ml-1 text-[8px] text-[var(--accent)]">(YOU)</span>}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] text-[var(--text-muted)]">{entry.totalPicks} picks</span>
                    <span className="text-[11px] font-black text-[var(--accent-soft)] tabular-nums">{entry.totalPoints} pts</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Recent predictions */}
      {myPredictions && myPredictions.length > 0 && (
        <div className="flex-shrink-0 border-t border-[var(--panel-mid)] max-h-[200px] flex flex-col">
          <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border-b border-[var(--panel-mid)]">
            <Target size={12} className="text-[var(--accent)]" />
            <span className="text-[10px] font-black text-[var(--panel-light)] tracking-[0.1em]">YOUR PICKS</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scroll p-2 space-y-1">
            {myPredictions.map(pred => {
              const match = matches?.find(m => m.id === pred.matchId);
              return (
                <div key={pred.id} className="flex items-center justify-between p-2 bg-[rgba(212,160,23,0.05)] rounded">
                  <span className="text-[9px] text-[var(--panel-light)]">
                    {match ? `${match.teamA} vs ${match.teamB}` : `Match #${pred.matchId}`}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-[var(--accent-soft)] tabular-nums">
                      {pred.predictedA}-{pred.predictedB}
                    </span>
                    {pred.points !== null && pred.points !== undefined && (
                      <span className="text-[9px] font-bold text-[var(--accent)]">{pred.points}pts</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
