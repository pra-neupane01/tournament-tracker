import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

export const NotFoundPage: FC = () => {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-red-500/10 p-4 rounded-full mb-6">
        <AlertTriangle className="h-12 w-12 text-red-500" />
      </div>
      <h1 className="text-4xl font-bold text-[var(--color-text-main)] mb-4">404</h1>
      <h2 className="text-xl font-medium text-[var(--color-text-main)] mb-2">Page Not Found</h2>
      <p className="text-[var(--color-text-muted)] max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/"
        className="px-6 py-3 bg-[var(--color-primary)] text-white font-medium rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors flex items-center gap-2"
      >
        <Home className="h-5 w-5" />
        Back to Home
      </Link>
    </div>
  );
};
