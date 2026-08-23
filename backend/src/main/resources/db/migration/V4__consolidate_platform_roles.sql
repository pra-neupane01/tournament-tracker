-- Platform access has three roles. Existing operational roles are retained as
-- organizer accounts; organization membership and roster roles remain separate.
UPDATE app_users
SET role = 'ORGANIZER'
WHERE role IN ('TOURNAMENT_MANAGER', 'REFEREE', 'TEAM_MANAGER');
