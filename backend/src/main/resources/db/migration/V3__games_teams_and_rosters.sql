CREATE TABLE games (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    platform VARCHAR(30) NOT NULL,
    team_size INTEGER NOT NULL,
    substitute_limit INTEGER NOT NULL,
    description VARCHAR(2000),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE teams (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    short_name VARCHAR(20),
    logo_url VARCHAR(255),
    game_id UUID NOT NULL REFERENCES games(id),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    manager_id UUID NOT NULL REFERENCES app_users(id),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_team_game_name UNIQUE (game_id, name)
);

CREATE TABLE team_members (
    id UUID PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES app_users(id),
    player_uid VARCHAR(100) NOT NULL,
    in_game_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_team_member_user UNIQUE (team_id, user_id),
    CONSTRAINT uk_team_member_player_uid UNIQUE (team_id, player_uid)
);

CREATE INDEX idx_teams_game ON teams(game_id);
CREATE INDEX idx_team_members_team ON team_members(team_id);
