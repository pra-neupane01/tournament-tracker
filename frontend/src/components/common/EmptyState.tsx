import type { FC } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: React.ReactNode;
}

export const EmptyState: FC<EmptyStateProps> = ({
  title = 'No data found',
  message = 'There is currently no data to display in this section.',
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] w-full border border-dashed border-[var(--color-border)] rounded-lg p-8 text-center bg-[var(--color-surface)]/30">
      <div className="bg-[var(--color-surface)] p-3 rounded-full mb-4">
        <Inbox className="h-8 w-8 text-[var(--color-text-muted)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text-main)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--color-text-muted)] max-w-md mb-6">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
