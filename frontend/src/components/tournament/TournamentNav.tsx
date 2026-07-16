import { NavLink } from 'react-router-dom';

export function TournamentNav({ tournamentId }: { tournamentId: string }) {
  return (
    <nav className="tournament-nav" aria-label="Tournament management">
      <NavLink end to={`/tournaments/${tournamentId}`}>
        Overview & rules
      </NavLink>
      <NavLink to={`/tournaments/${tournamentId}/registration-form`}>
        Registration form
      </NavLink>
      <NavLink to={`/tournaments/${tournamentId}/registrations`}>
        Registrations
      </NavLink>
      <NavLink to={`/tournaments/${tournamentId}/competition`}>
        Competition
      </NavLink>
      <NavLink to={`/tournaments/${tournamentId}/governance`}>
        Governance
      </NavLink>
      <NavLink to={`/tournaments/${tournamentId}/assets`}>
        Assets
      </NavLink>
    </nav>
  );
}
