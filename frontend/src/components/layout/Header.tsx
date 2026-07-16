import type { FC } from 'react';
import { Menu, User, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header: FC = () => {
  return (
    <header className="h-16 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors">
          <Menu className="h-5 w-5" />
        </button>
        <Link to="/" className="font-bold text-lg text-[var(--color-primary)] tracking-tight">
          EsportsManager
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-[var(--color-surface)]"></span>
        </button>
        <div className="h-8 w-8 rounded-full bg-[var(--color-background)] flex items-center justify-center border border-[var(--color-border)]">
          <User className="h-4 w-4 text-[var(--color-text-muted)]" />
        </div>
      </div>
    </header>
  );
};
