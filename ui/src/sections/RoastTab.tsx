import { trpc } from '@/providers/trpc';
import { useAuth } from '@/hooks/useAuth';
import { Flame, User, ThumbsUp, Send, Zap } from 'lucide-react';
import { useState } from 'react';

export default function RoastTab() {
  const { user, isAuthenticated } = useAuth();
  const { data: roasts, isLoading, refetch } = trpc.roast.list.useQuery();
  const { data: predictions } = trpc.prediction.list.useQuery();
  const [message, setMessage] = useState('');
  const [burnLevel, setBurnLevel] = useState(1);
  const [selectedPred, setSelectedPred] = useState<number | null>(null);

  const createRoast = trpc.roast.create.useMutation({
    onSuccess: () => {
      setMessage('');
      setSelectedPred(null);
      refetch();
    },
  });

  const likeRoast = trpc.roast.like.useMutation({
    onSuccess: () => refetch(),
  });

  const handleSubmit = () => {
    if (!message.trim() || !isAuthenticated) return;
    const targetPred = predictions?.find(p => p.id === selectedPred);
    createRoast.mutate({
      userName: user?.name || 'Anonymous',
      message: message.trim(),
      burnLevel,
      targetUserId: targetPred?.userId,
      targetUserName: targetPred?.userName,
      predictionId: selectedPred || undefined,
    });
  };

  const getBurnColor = (level: number) => {
    switch (level) {
      case 1: return 'text-green-400';
      case 2: return 'text-yellow-400';
      case 3: return 'text-orange-400';
      case 4: return 'text-red-400';
      case 5: return 'text-red-600';
      default: return 'text-[var(--accent-soft)]';
    }
  };

  const getBurnLabel = (level: number) => {
    switch (level) {
      case 1: return 'MILD';
      case 2: return 'WARM';
      case 3: return 'HOT';
      case 4: return 'BLAZING';
      case 5: return 'INFERNO';
      default: return 'MILD';
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Compose roast */}
      {isAuthenticated && (
        <div className="flex-shrink-0 border-b border-[var(--panel-mid)] p-3 space-y-2">
          {/* Prediction selector */}
          <select
            value={selectedPred || ''}
            onChange={(e) => setSelectedPred(e.target.value ? Number(e.target.value) : null)}
            className="w-full bg-[rgba(212,160,23,0.08)] border border-[var(--panel-mid)] text-[10px] text-[var(--panel-light)] px-2 py-1.5 outline-none focus:border-[var(--accent)] transition-colors"
          >
            <option value="">Select a prediction to roast...</option>
            {predictions?.map(p => (
              <option key={p.id} value={p.id}>
                {p.userName}: {p.predictedA}-{p.predictedB}
              </option>
            ))}
          </select>

          {/* Message input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Drop a roast..."
              className="flex-1 bg-[rgba(212,160,23,0.08)] border border-[var(--panel-mid)] text-[10px] text-white px-2 py-1.5 outline-none focus:border-[var(--accent)] placeholder:text-[var(--text-muted)] transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <button
              onClick={handleSubmit}
              disabled={!message.trim() || createRoast.isPending}
              className="px-3 py-1.5 bg-[var(--accent)] text-[var(--panel-dark)] text-[9px] font-black tracking-[0.1em] hover:bg-[var(--accent-soft)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <Send size={12} />
            </button>
          </div>

          {/* Burn level */}
          <div className="flex items-center gap-2">
            <Zap size={10} className="text-[var(--accent)]" />
            <span className="text-[8px] font-bold text-[var(--text-muted)]">BURN LEVEL:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(level => (
                <button
                  key={level}
                  onClick={() => setBurnLevel(level)}
                  className={`w-5 h-5 text-[8px] font-black border transition-all ${
                    burnLevel === level
                      ? 'border-[var(--accent)] bg-[rgba(212,160,23,0.2)] text-[var(--accent-soft)]'
                      : 'border-[var(--panel-mid)] text-[var(--text-muted)] hover:border-[var(--accent)]'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <span className={`text-[8px] font-bold ${getBurnColor(burnLevel)}`}>
              {getBurnLabel(burnLevel)}
            </span>
          </div>
        </div>
      )}

      {/* Roasts list */}
      <div className="flex-1 overflow-y-auto custom-scroll p-3 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <span className="text-[10px] font-bold text-[var(--text-muted)] animate-pulse">LOADING ROASTS...</span>
          </div>
        ) : !roasts || roasts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <Flame size={20} className="text-[var(--text-muted)]" />
            <span className="text-[10px] font-bold text-[var(--text-muted)]">NO ROASTS YET</span>
            <span className="text-[9px] text-[var(--text-muted)]">Light the fire!</span>
          </div>
        ) : (
          roasts.map((roast) => (
            <div
              key={roast.id}
              className="glow-border data-panel rounded p-3 animate-slide-up"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[var(--panel-mid)] flex items-center justify-center">
                    <User size={10} className="text-[var(--accent-soft)]" />
                  </div>
                  <span className="text-[10px] font-bold text-[var(--panel-light)]">{roast.userName}</span>
                  {roast.targetUserName && (
                    <>
                      <span className="text-[8px] text-[var(--text-muted)]">roasts</span>
                      <span className="text-[10px] font-bold text-red-400">{roast.targetUserName}</span>
                    </>
                  )}
                </div>
                <div className={`flex items-center gap-0.5 ${getBurnColor(roast.burnLevel)}`}>
                  <Flame size={10} />
                  <span className="text-[8px] font-bold">{getBurnLabel(roast.burnLevel)}</span>
                </div>
              </div>

              {/* Message */}
              <p className="text-[11px] text-white leading-relaxed mb-2">{roast.message}</p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className="text-[8px] text-[var(--text-muted)]">
                  {new Date(roast.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => likeRoast.mutate({ id: roast.id })}
                  className="flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--accent-soft)] transition-colors"
                >
                  <ThumbsUp size={10} />
                  <span className="text-[8px] font-bold">{roast.likes || 0}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
