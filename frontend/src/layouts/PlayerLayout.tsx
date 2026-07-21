import type { FC } from 'react';
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { PlayerHeader } from '../components/layout/PlayerHeader';
import { PlayerFooter } from '../components/layout/PlayerFooter';


export const PlayerLayout: FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col">
      <PlayerHeader />
      


      <main className="flex-1 flex flex-col w-full">
        <Outlet />
      </main>

      <PlayerFooter />
    </div>
  );
};
