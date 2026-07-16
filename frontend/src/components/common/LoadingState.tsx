import type { FC } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: FC<LoadingStateProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full text-[var(--color-text-muted)]">
      <Loader2 className="h-8 w-8 animate-spin mb-4 text-[var(--color-primary)]" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};
