import type { FC } from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const PageContainer: FC<PageContainerProps> = ({ 
  children, 
  title, 
  description,
  action
}) => {
  return (
    <div className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-main)] tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-[var(--color-text-muted)] mt-1">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};
