CREATE TABLE tournaments (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    game_id UUID NOT NULL REFERENCES games(id),
    created_by UUID NOT NULL REFERENCES app_users(id),
    name VARCHAR(180) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    description VARCHAR(5000),
    format VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    time_zone VARCHAR(60) NOT NULL,
    registration_opens_at TIMESTAMP,
    registration_closes_at TIMESTAMP,
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP,
    minimum_teams INTEGER NOT NULL,
    maximum_teams INTEGER NOT NULL,
    minimum_roster_size INTEGER NOT NULL,
    maximum_roster_size INTEGER NOT NULL,
    allow_substitutes BOOLEAN NOT NULL DEFAULT FALSE,
    public_visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE tournament_rules (
    id UUID PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    title VARCHAR(180) NOT NULL,
    content VARCHAR(10000) NOT NULL,
    sort_order INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_tournaments_organization ON tournaments(organization_id);
CREATE INDEX idx_tournaments_game_status ON tournaments(game_id, status);
CREATE INDEX idx_tournament_rules_order ON tournament_rules(tournament_id, sort_order);
