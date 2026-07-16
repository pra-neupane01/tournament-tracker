import { RouterProvider } from 'react-router-dom';
import { QueryProvider } from './app/providers/QueryProvider';
import { router } from './app/router';
import { SessionBootstrap } from './features/auth/SessionBootstrap';

function App() {
  return (
    <QueryProvider>
      <SessionBootstrap>
        <RouterProvider router={router} />
      </SessionBootstrap>
    </QueryProvider>
  );
}

export default App;
