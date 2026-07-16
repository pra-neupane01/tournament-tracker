CREATE TABLE tournament_stages (
    id UUID PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    name VARCHAR(160) NOT NULL,
    type VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL,
    sequence_number INTEGER NOT NULL,
    best_of INTEGER NOT NULL,
    qualifiers_per_group INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_tournament_stage_sequence UNIQUE (tournament_id, sequence_number)
);

CREATE TABLE stage_groups (
    id UUID PRIMARY KEY,
    stage_id UUID NOT NULL REFERENCES tournament_stages(id) ON DELETE CASCADE,
    name VARCHAR(80) NOT NULL,
    group_number INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_stage_group_number UNIQUE (stage_id, group_number)
);

CREATE TABLE stage_group_participants (
    id UUID PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES stage_groups(id) ON DELETE CASCADE,
    registration_id UUID NOT NULL REFERENCES tournament_registrations(id),
    seed INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_stage_group_registration UNIQUE (group_id, registration_id)
);

CREATE TABLE fixtures (
    id UUID PRIMARY KEY,
    stage_id UUID NOT NULL REFERENCES tournament_stages(id) ON DELETE CASCADE,
    group_id UUID REFERENCES stage_groups(id) ON DELETE SET NULL,
    round_number INTEGER NOT NULL,
    match_number INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    winner_registration_id UUID REFERENCES tournament_registrations(id),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE fixture_participants (
    id UUID PRIMARY KEY,
    fixture_id UUID NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
    registration_id UUID NOT NULL REFERENCES tournament_registrations(id),
    slot_number INTEGER NOT NULL,
    seed INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_fixture_registration UNIQUE (fixture_id, registration_id),
    CONSTRAINT uk_fixture_slot UNIQUE (fixture_id, slot_number)
);

CREATE INDEX idx_stages_tournament ON tournament_stages(tournament_id, sequence_number);
CREATE INDEX idx_fixtures_stage_round ON fixtures(stage_id, round_number, match_number);
