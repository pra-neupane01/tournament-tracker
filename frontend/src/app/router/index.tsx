import type { ComponentType } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../../features/auth/ProtectedRoute';
import { DashboardLayout } from '../../layouts/DashboardLayout';

const lazyRoute = (
  loader: () => Promise<Record<string, unknown>>,
  exportName: string,
) => async () => {
  const module = await loader();
  return { Component: module[exportName] as ComponentType };
};

export const router = createBrowserRouter([
  {
    path: '/',
    lazy: lazyRoute(() => import('../../pages/LandingPage'), 'LandingPage'),
  },
  {
    path: '/login',
    lazy: lazyRoute(() => import('../../pages/LoginPage'), 'LoginPage'),
  },
  {
    path: '/register',
    lazy: lazyRoute(() => import('../../pages/RegisterPage'), 'RegisterPage'),
  },
  {
    path: '/verify-certificate',
    lazy: lazyRoute(
      () => import('../../pages/VerifyCertificatePage'),
      'VerifyCertificatePage',
    ),
  },
  {
    path: '/verify-certificate/:verificationCode',
    lazy: lazyRoute(
      () => import('../../pages/VerifyCertificatePage'),
      'VerifyCertificatePage',
    ),
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
            lazy: lazyRoute(() => import('../../pages/DashboardPage'), 'DashboardPage'),
          },
          {
            path: 'organizations',
            lazy: lazyRoute(
              () => import('../../pages/OrganizationsPage'),
              'OrganizationsPage',
            ),
          },
          {
            path: 'users',
            lazy: lazyRoute(() => import('../../pages/UsersPage'), 'UsersPage'),
          },
          {
            path: 'games',
            lazy: lazyRoute(() => import('../../pages/GamesPage'), 'GamesPage'),
          },
          {
            path: 'teams',
            lazy: lazyRoute(() => import('../../pages/TeamsPage'), 'TeamsPage'),
          },
          {
            path: 'matches',
            lazy: lazyRoute(() => import('../../pages/MatchesPage'), 'MatchesPage'),
          },
          {
            path: 'notifications',
            lazy: lazyRoute(
              () => import('../../pages/NotificationsPage'),
              'NotificationsPage',
            ),
          },
          {
            path: 'certificates',
            lazy: lazyRoute(
              () => import('../../pages/CertificatesPage'),
              'CertificatesPage',
            ),
          },
          {
            path: 'settings',
            lazy: lazyRoute(() => import('../../pages/SettingsPage'), 'SettingsPage'),
          },
          {
            path: 'tournaments',
            lazy: lazyRoute(
              () => import('../../pages/TournamentsPage'),
              'TournamentsPage',
            ),
          },
          {
            path: 'tournaments/:tournamentId',
            lazy: lazyRoute(
              () => import('../../pages/TournamentDetailPage'),
              'TournamentDetailPage',
            ),
          },
          {
            path: 'tournaments/:tournamentId/registration-form',
            lazy: lazyRoute(
              () => import('../../pages/RegistrationFormBuilderPage'),
              'RegistrationFormBuilderPage',
            ),
          },
          {
            path: 'tournaments/:tournamentId/registrations',
            lazy: lazyRoute(
              () => import('../../pages/TournamentRegistrationsPage'),
              'TournamentRegistrationsPage',
            ),
          },
          {
            path: 'tournaments/:tournamentId/competition',
            lazy: lazyRoute(
              () => import('../../pages/TournamentCompetitionPage'),
              'TournamentCompetitionPage',
            ),
          },
          {
            path: 'tournaments/:tournamentId/stages/:stageId/fixtures/:fixtureId',
            lazy: lazyRoute(
              () => import('../../pages/MatchOperationsPage'),
              'MatchOperationsPage',
            ),
          },
          {
            path: 'tournaments/:tournamentId/governance',
            lazy: lazyRoute(
              () => import('../../pages/TournamentGovernancePage'),
              'TournamentGovernancePage',
            ),
          },
          {
            path: 'tournaments/:tournamentId/assets',
            lazy: lazyRoute(
              () => import('../../pages/TournamentAssetsPage'),
              'TournamentAssetsPage',
            ),
          },
        ],
      },
    ],
  },
  {
    path: '/not-found',
    lazy: lazyRoute(() => import('../../pages/NotFoundPage'), 'NotFoundPage'),
  },
  {
    path: '*',
    element: <Navigate to="/not-found" replace />,
  },
]);
