import { trpc } from '@/providers/trpc';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { Calendar, Trophy, ChevronRight, Check, AlertCircle } from 'lucide-react';

export default function NewPickTab() {
  const { user, isAuthenticated } = useAuth();
  const { data: matches, isLoading } = trpc.match.list.useQuery();
  const { data: myPredictions, refetch: refetchMy } = trpc.prediction.myPredictions.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const { data: allPredictions, refetch: refetchAll } = trpc.prediction.list.useQuery();

  const [scoreA, setScoreA] = useState<Record<number, string>>({});
  const [scoreB, setScoreB] = useState<Record<number, string>>({});
  const [expandedMatch, setExpandedMatch] = useState<number | null>(null);
  const [justPicked, setJustPicked] = useState<number | null>(null);

  const createPred = trpc.prediction.create.useMutation({
    onSuccess: () => {
      refetchMy();
      refetchAll();
      setJustPicked(expandedMatch);
      setTimeout(() => setJustPicked(null), 2000);
    },
  });

  const getMyPrediction = (matchId: number) =>
    myPredictions?.find(p => p.matchId === matchId);

  const getPredictionCount = (matchId: number) =>
    allPredictions?.filter(p => p.matchId === matchId).length || 0;

  const handlePick = (matchId: number) => {
    if (!isAuthenticated || !user) return;
    const a = parseInt(scoreA[matchId] || '0');
    const b = parseInt(scoreB[matchId] || '0');
    if (isNaN(a) || isNaN(b)) return;
    createPred.mutate({
      matchId,
      userName: user.name || 'Anonymous',
      predictedA: a,
      predictedB: b,
    });
  };

  const upcomingMatches = matches
    ?.filter(m => m.status === 'upcoming')
    .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime());

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Stats bar */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2 border-b border-[var(--panel-mid)]">
        <div className="flex items-center gap-1">
          <Calendar size={10} className="text-[var(--accent)]" />
          <span className="text-[9px] font-bold text-[var(--panel-light)]">{upcomingMatches?.length || 0} MATCHES</span>
        </div>
        {isAuthenticated && (
          <div className="flex items-center gap-1">
            <Trophy size={10} className="text-[var(--accent)]" />
            <span className="text-[9px] font-bold text-[var(--panel-light)]">{myPredictions?.length || 0} YOUR PICKS</span>
          </div>
        )}
      </div>

      {/* Match list */}
      <div className="flex-1 overflow-y-auto custom-scroll p-3 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <span className="text-[10px] font-bold text-[var(--text-muted)] animate-pulse">LOADING MATCHES...</span>
          </div>
        ) : !upcomingMatches || upcomingMatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <Calendar size={20} className="text-[var(--text-muted)]" />
            <span className="text-[10px] font-bold text-[var(--text-muted)]">NO UPCOMING MATCHES</span>
          </div>
        ) : (
          upcomingMatches.map((match) => {
            const myPred = getMyPrediction(match.id);
            const predCount = getPredictionCount(match.id);
            const isExpanded = expandedMatch === match.id;
            const isPicked = justPicked === match.id;

            return (
              <div
                key={match.id}
                className={`glow-border data-panel rounded overflow-hidden transition-all ${
                  isPicked ? 'border-green-500' : ''
                }`}
              >
                {/* Match header */}
                <button
                  onClick={() => setExpandedMatch(isExpanded ? null : match.id)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-[rgba(212,160,23,0.05)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <span className="text-base font-black text-white">{match.teamAFlag}</span>
                      <span className="text-[8px] font-bold text-[var(--panel-light)]">{match.teamA}</span>
                    </div>
                    <span className="text-[10px] font-bold text-[var(--text-muted)]">VS</span>
                    <div className="flex flex-col items-center">
                      <span className="text-base font-black text-white">{match.teamBFlag}</span>
                      <span className="text-[8px] font-bold text-[var(--panel-light)]">{match.teamB}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {myPred && (
                      <div className="amber-badge px-2 py-0.5 rounded text-[8px] font-bold">
                        {myPred.predictedA}-{myPred.predictedB}
                      </div>
                    )}
                    <span className="text-[8px] text-[var(--text-muted)] bg-[var(--panel-mid)] px-1.5 py-0.5 rounded">{match.stage}</span>
                    <span className="text-[8px] text-[var(--text-muted)]">{predCount} picks</span>
                    <ChevronRight
                      size={12}
                      className={`text-[var(--text-muted)] transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  </div>
                </button>

                {/* Expanded pick form */}
                {isExpanded && (
                  <div className="border-t border-[var(--panel-mid)] p-3 animate-slide-up">
                    {myPred ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <div className="flex items-center gap-2 text-green-400">
                          <Check size={14} />
                          <span className="text-[10px] font-bold">ALREADY PICKED: {myPred.predictedA}-{myPred.predictedB}</span>
                        </div>
                        <p className="text-[9px] text-[var(--text-muted)]">
                          {new Date(match.matchDate).toLocaleString()}
                        </p>
                      </div>
                    ) : !isAuthenticated ? (
                      <div className="flex items-center justify-center gap-2 py-3 text-[var(--text-muted)]">
                        <AlertCircle size={12} />
                        <span className="text-[10px] font-bold">Sign in to make a pick</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-4">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-bold text-[var(--panel-light)]">{match.teamA}</span>
                            <input
                              type="number"
                              min={0}
                              max={20}
                              value={scoreA[match.id] || ''}
                              onChange={(e) => setScoreA(prev => ({ ...prev, [match.id]: e.target.value }))}
                              className="score-input"
                              placeholder="0"
                            />
                          </div>
                          <span className="text-xs font-bold text-[var(--text-muted)] mt-4">-</span>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-bold text-[var(--panel-light)]">{match.teamB}</span>
                            <input
                              type="number"
                              min={0}
                              max={20}
                              value={scoreB[match.id] || ''}
                              onChange={(e) => setScoreB(prev => ({ ...prev, [match.id]: e.target.value }))}
                              className="score-input"
                              placeholder="0"
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => handlePick(match.id)}
                          disabled={createPred.isPending || scoreA[match.id] === undefined || scoreB[match.id] === undefined}
                          className="w-full py-2 bg-[var(--accent)] text-[var(--panel-dark)] text-[10px] font-black tracking-[0.15em] hover:bg-[var(--accent-soft)] disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1"
                        >
                          {createPred.isPending ? (
                            <span className="animate-pulse">SUBMITTING...</span>
                          ) : (
                            <>
                              <Trophy size={12} />
                              LOCK IT IN
                            </>
                          )}
                        </button>

                        <p className="text-center text-[8px] text-[var(--text-muted)]">
                          {new Date(match.matchDate).toLocaleString()}
                        </p>
                      </div>
                    )}
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
