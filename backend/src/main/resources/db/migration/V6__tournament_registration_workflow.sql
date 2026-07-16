CREATE TABLE tournament_registrations (
    id UUID PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id),
    submitted_by UUID NOT NULL REFERENCES app_users(id),
    status VARCHAR(20) NOT NULL,
    reviewed_by UUID REFERENCES app_users(id),
    reviewed_at TIMESTAMP,
    review_notes VARCHAR(2000),
    submitted_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_tournament_team_registration UNIQUE (tournament_id, team_id)
);

CREATE TABLE registration_players (
    id UUID PRIMARY KEY,
    registration_id UUID NOT NULL REFERENCES tournament_registrations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    player_uid VARCHAR(100) NOT NULL,
    in_game_name VARCHAR(100) NOT NULL,
    roster_role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_registration_player UNIQUE (registration_id, user_id)
);

CREATE TABLE registration_answers (
    id UUID PRIMARY KEY,
    registration_id UUID NOT NULL REFERENCES tournament_registrations(id) ON DELETE CASCADE,
    field_key VARCHAR(80) NOT NULL,
    field_label VARCHAR(160) NOT NULL,
    answer_value VARCHAR(10000) NOT NULL,
    value_order INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_tournament_registrations_status
    ON tournament_registrations(tournament_id, status);
CREATE INDEX idx_registration_players_registration
    ON registration_players(registration_id);
CREATE INDEX idx_registration_answers_registration
    ON registration_answers(registration_id);
