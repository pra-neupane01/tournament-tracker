import type { FC } from 'react';
import { Trophy, Lock, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LoginPage: FC = () => {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center bg-[var(--color-surface)] p-3 rounded-xl border border-[var(--color-border)] mb-4">
            <Trophy className="h-8 w-8 text-[var(--color-primary)]" />
          </Link>
          <h2 className="text-2xl font-bold text-[var(--color-text-main)]">Welcome back</h2>
          <p className="text-[var(--color-text-muted)] mt-2">Sign in to your organizer account</p>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-8 shadow-xl">
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-500/90 flex flex-col gap-1">
            <strong>Note:</strong> Authentication will be connected in Chunk 2. This is purely visual right now.
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-main)]">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[var(--color-text-muted)]" />
                </div>
                <input 
                  type="email" 
                  className="w-full bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text-main)] rounded-lg pl-10 px-4 py-2.5 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  placeholder="admin@college.edu"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[var(--color-text-main)]">Password</label>
                <a href="#" className="text-xs text-[var(--color-primary)] hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[var(--color-text-muted)]" />
                </div>
                <input 
                  type="password" 
                  className="w-full bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text-main)] rounded-lg pl-10 px-4 py-2.5 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="button"
              className="w-full bg-[var(--color-primary)] text-white font-semibold rounded-lg py-2.5 hover:bg-[var(--color-primary-hover)] transition-colors mt-2"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
