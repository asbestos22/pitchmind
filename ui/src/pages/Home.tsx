import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, Flame, PlusCircle, Activity, Radio } from 'lucide-react';
import FeedTab from '@/sections/FeedTab';
import RoastTab from '@/sections/RoastTab';
import NewPickTab from '@/sections/NewPickTab';
import StatusTab from '@/sections/StatusTab';
import { THEME } from '@/types/theme';

type Tab = 'feed' | 'roast' | 'newpick' | 'status';

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

const TAB_CONFIG: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'feed', label: 'FEED', icon: <Radio size={14} strokeWidth={2.5} /> },
  { id: 'roast', label: 'ROAST', icon: <Flame size={14} strokeWidth={2.5} /> },
  { id: 'newpick', label: 'NEW PICK', icon: <PlusCircle size={14} strokeWidth={2.5} /> },
  { id: 'status', label: 'STATUS', icon: <Activity size={14} strokeWidth={2.5} /> },
];

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('feed');

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--panel-dark', THEME.panelDark);
    root.style.setProperty('--panel-mid', THEME.panelMid);
    root.style.setProperty('--panel-light', THEME.panelLight);
    root.style.setProperty('--accent', THEME.color1);
    root.style.setProperty('--accent-soft', THEME.color2);
    root.style.setProperty('--text-muted', THEME.textMuted);
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case 'feed': return <FeedTab />;
      case 'roast': return <RoastTab />;
      case 'newpick': return <NewPickTab />;
      case 'status': return <StatusTab />;
    }
  };

  return (
    <div className="w-screen h-screen bg-[var(--panel-dark)] flex flex-col overflow-hidden">
      {/* ===== HEADER ===== */}
      <header className="flex-shrink-0 h-14 border-b border-[var(--panel-mid)] flex items-center justify-between px-4 glow-border-strong">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-soft)] flex items-center justify-center">
            <Flame size={16} className="text-[var(--panel-dark)]" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-white leading-none">STRIKER</h1>
            <p className="text-[8px] font-bold text-[var(--text-muted)] tracking-[0.2em]">WORLD CUP PREDICTOR</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-[var(--panel-light)]">{user?.name}</span>
              <button
                onClick={logout}
                className="px-3 py-1 text-[9px] font-bold tracking-[0.1em] border border-[var(--panel-mid)] text-[var(--text-muted)] hover:text-white hover:border-[var(--accent)] transition-all"
              >
                OUT
              </button>
            </div>
          ) : (
            <button
              onClick={() => { window.location.href = getOAuthUrl(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--accent)] text-[9px] font-bold tracking-[0.15em] text-[var(--accent-soft)] hover:bg-[var(--accent)] hover:text-[var(--panel-dark)] transition-all"
            >
              <LogIn size={12} strokeWidth={2.5} />
              SIGN IN
            </button>
          )}
        </div>
      </header>

      {/* ===== TAB NAV ===== */}
      <nav className="flex-shrink-0 flex border-b border-[var(--panel-mid)]">
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] font-bold tracking-[0.15em] transition-all border-b-2 ${
              activeTab === tab.id
                ? 'text-[var(--accent-soft)] border-[var(--accent)] bg-[rgba(212,160,23,0.08)]'
                : 'text-[var(--text-muted)] border-transparent hover:text-[var(--panel-light)] hover:bg-[rgba(212,160,23,0.03)]'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ===== TAB CONTENT ===== */}
      <main className="flex-1 overflow-hidden">
        {renderTab()}
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="flex-shrink-0 h-8 border-t border-[var(--panel-mid)] flex items-center justify-between px-4">
        <span className="text-[8px] font-bold text-[var(--text-muted)] tracking-[0.15em]">WC 2026 // LIVE DATA</span>
        <span className="text-[8px] font-bold text-[var(--accent)] tracking-[0.1em]">SYS // 60 FPS</span>
      </footer>
    </div>
  );
}
