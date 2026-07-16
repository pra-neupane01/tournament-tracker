import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from './authStore';

export function SessionBootstrap({ children }: { children: ReactNode }) {
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    void restoreSession();

    const handleExpiredSession = () => clearSession();
    window.addEventListener('auth:expired', handleExpiredSession);
    return () => window.removeEventListener('auth:expired', handleExpiredSession);
  }, [clearSession, restoreSession]);

  return children;
}
