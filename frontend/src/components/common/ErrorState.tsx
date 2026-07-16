import type { FC } from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: FC<ErrorStateProps> = ({ 
  title = 'An error occurred', 
  message = 'Something went wrong while loading the data.',
  onRetry 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-6 text-center">
      <div className="bg-red-500/10 p-3 rounded-full mb-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text-main)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--color-text-muted)] max-w-md mb-6">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-hover)] transition-colors text-sm font-medium"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
