import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ArrowRight } from 'lucide-react';

export const LandingPage: FC = () => {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-primary)]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-primary)]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-3xl w-full text-center z-10 space-y-8">
        <div className="flex justify-center mb-6">
          <div className="bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-border)] shadow-xl">
            <Trophy className="h-16 w-16 text-[var(--color-primary)]" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold text-[var(--color-text-main)] tracking-tight">
          Esports Tournament <br className="hidden md:block" />
          <span className="text-[var(--color-primary)]">Management System</span>
        </h1>
        
        <p className="text-lg md:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto leading-relaxed">
          Manage registrations, tournaments, matches, scoring and participants from one professional platform built for colleges and independent organizers.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link 
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 bg-[var(--color-primary)] text-white font-semibold rounded-lg shadow-lg shadow-[var(--color-primary)]/25 hover:bg-[var(--color-primary-hover)] transition-all flex items-center justify-center gap-2"
          >
            Organizer Login
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link 
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 bg-[var(--color-surface)] text-[var(--color-text-main)] font-semibold rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-all flex items-center justify-center gap-2"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
