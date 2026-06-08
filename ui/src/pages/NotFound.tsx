import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="w-screen h-screen bg-[var(--panel-dark)] flex flex-col items-center justify-center gap-3">
      <AlertCircle size={32} className="text-[var(--accent)]" />
      <h1 className="text-2xl font-black text-white">404</h1>
      <p className="text-[10px] font-bold text-[var(--text-muted)] tracking-[0.2em]">PAGE NOT FOUND</p>
    </div>
  );
}
