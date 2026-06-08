import { trpc } from '@/providers/trpc';
import { Trophy, Clock, User, Flame } from 'lucide-react';
import { useState } from 'react';

export default function FeedTab() {
  const { data: predictions, isLoading } = trpc.prediction.list.useQuery();
  const { data: matches } = trpc.match.list.useQuery();
  const [filter, setFilter] = useState<'all' | 'recent'>('all');

  const getMatch = (matchId: number) => matches?.find(m => m.id === matchId);

  const sortedPredictions = predictions
    ? [...predictions].sort((a, b) => {
        if (filter === 'recent') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
      })
    : [];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Filter bar */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border-b border-[var(--panel-mid)]">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 text-[9px] font-bold tracking-[0.1em] border transition-all ${
            filter === 'all'
              ? 'border-[var(--accent)] text-[var(--accent-soft)] bg-[rgba(212,160,23,0.1)]'
              : 'border-[var(--panel-mid)] text-[var(--text-muted)] hover:text-[var(--panel-light)]'
          }`}
        >
          ALL
        </button>
        <button
          onClick={() => setFilter('recent')}
          className={`px-3 py-1 text-[9px] font-bold tracking-[0.1em] border transition-all ${
            filter === 'recent'
              ? 'border-[var(--accent)] text-[var(--accent-soft)] bg-[rgba(212,160,23,0.1)]'
              : 'border-[var(--panel-mid)] text-[var(--text-muted)] hover:text-[var(--panel-light)]'
          }`}
        >
          RECENT
        </button>
        <div className="ml-auto flex items-center gap-1 text-[var(--text-muted)]">
          <Trophy size={10} />
          <span className="text-[9px] font-bold">{predictions?.length || 0} PICKS</span>
        </div>
      </div>

      {/* Predictions list */}
      <div className="flex-1 overflow-y-auto custom-scroll p-3 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <span className="text-[10px] font-bold text-[var(--text-muted)] animate-pulse">LOADING PREDICTIONS...</span>
          </div>
        ) : sortedPredictions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <Flame size={20} className="text-[var(--text-muted)]" />
            <span className="text-[10px] font-bold text-[var(--text-muted)]">NO PREDICTIONS YET</span>
            <span className="text-[9px] text-[var(--text-muted)]">Be the first to make a pick!</span>
          </div>
        ) : (
          sortedPredictions.map((pred) => {
            const match = getMatch(pred.matchId);
            return (
              <div
                key={pred.id}
                className="glow-border data-panel rounded p-3 animate-slide-up"
              >
                {/* User info */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[var(--panel-mid)] flex items-center justify-center">
                      <User size={10} className="text-[var(--accent-soft)]" />
                    </div>
                    <span className="text-[10px] font-bold text-[var(--panel-light)]">{pred.userName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[var(--text-muted)]">
                    <Clock size={9} />
                    <span className="text-[8px] font-semibold">
                      {new Date(pred.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Match & Prediction */}
                {match && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-[var(--text-muted)] bg-[rgba(212,160,23,0.1)] px-1.5 py-0.5 rounded">{match.stage}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">{match.teamA} vs {match.teamB}</span>
                    </div>
                  </div>
                )}

                {/* Score prediction */}
                <div className="flex items-center justify-center gap-3 mt-2 py-2">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-white">{match?.teamA || 'Team A'}</span>
                    <span className="text-lg font-black text-[var(--accent-soft)] tabular-nums glow-text">{pred.predictedA}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[var(--text-muted)]">-</span>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-white">{match?.teamB || 'Team B'}</span>
                    <span className="text-lg font-black text-[var(--accent-soft)] tabular-nums glow-text">{pred.predictedB}</span>
                  </div>
                </div>

                {/* Points */}
                {pred.points !== null && pred.points !== undefined && pred.points > 0 && (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Trophy size={10} className="text-[var(--accent)]" />
                    <span className="text-[9px] font-bold text-[var(--accent)]">{pred.points} PTS</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
