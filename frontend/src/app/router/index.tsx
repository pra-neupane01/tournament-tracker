import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { LandingPage } from '../../pages/LandingPage';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { NotFoundPage } from '../../pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      // Placeholders for future features
      {
        path: 'tournaments',
        element: <div className="p-6">Tournaments (Coming in Chunk 3)</div>,
      },
      {
        path: 'teams',
        element: <div className="p-6">Teams (Coming in Chunk 3)</div>,
      },
      {
        path: 'matches',
        element: <div className="p-6">Matches (Coming in Chunk 3)</div>,
      },
      {
        path: 'settings',
        element: <div className="p-6">Settings (Coming in Chunk 2)</div>,
      },
    ],
  },
  {
    path: '/not-found',
    element: <NotFoundPage />,
  },
  {
    path: '*',
    element: <Navigate to="/not-found" replace />,
  },
]);
