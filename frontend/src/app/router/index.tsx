import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { LandingPage } from '../../pages/LandingPage';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { NotFoundPage } from '../../pages/NotFoundPage';
import { RegisterPage } from '../../pages/RegisterPage';
import { SettingsPage } from '../../pages/SettingsPage';
import { ProtectedRoute } from '../../features/auth/ProtectedRoute';
import { OrganizationsPage } from '../../pages/OrganizationsPage';
import { UsersPage } from '../../pages/UsersPage';
import { GamesPage } from '../../pages/GamesPage';
import { TeamsPage } from '../../pages/TeamsPage';
import { TournamentsPage } from '../../pages/TournamentsPage';
import { TournamentDetailPage } from '../../pages/TournamentDetailPage';

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
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },
          {
            path: 'organizations',
            element: <OrganizationsPage />,
          },
          {
            path: 'users',
            element: <UsersPage />,
          },
          {
            path: 'games',
            element: <GamesPage />,
          },
          {
            path: 'tournaments',
            element: <TournamentsPage />,
          },
          {
            path: 'tournaments/:tournamentId',
            element: <TournamentDetailPage />,
          },
          {
            path: 'teams',
            element: <TeamsPage />,
          },
          {
            path: 'matches',
            element: <div className="p-6">Matches</div>,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
        ],
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
