# EsportsManager Frontend

React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, Zustand, React Hook Form, and Zod power the management client.

## Development

```bash
npm install
npm run dev
```

Set `VITE_API_BASE_URL` in `.env` when the backend is not available at `http://localhost:8080/api/v1`.

## Verification

```bash
npm run check
```

This runs Oxlint, TypeScript project compilation, and the optimized Vite production build.

## Implemented Workflows

- JWT login, registration, rotating refresh, protected routes, account restoration, and password changes.
- Organization/institution CRUD, memberships, platform user administration, games, teams, and rosters.
- Tournament CRUD, lifecycle management, rules, dynamic registration forms, submissions, and review.
- Stages, groups, fixture generation, match scheduling, protected rooms, check-in, scoring, results, leaderboards, and qualification.
- Penalties, disputes, live/persistent notifications, tournament announcements, files, CSV reports, and verifiable PDF certificates.

Feature routes are lazy-loaded, and the authenticated application shell is responsive on mobile and desktop.
