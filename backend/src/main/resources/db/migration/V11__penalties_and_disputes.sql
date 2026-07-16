CREATE TABLE penalties (
    id UUID PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    registration_id UUID NOT NULL REFERENCES tournament_registrations(id),
    fixture_id UUID REFERENCES fixtures(id) ON DELETE SET NULL,
    type VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL,
    points_deducted NUMERIC(14, 4) NOT NULL,
    reason VARCHAR(2000) NOT NULL,
    issued_by UUID NOT NULL REFERENCES app_users(id),
    issued_at TIMESTAMP NOT NULL,
    revoked_by UUID REFERENCES app_users(id),
    revoked_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE disputes (
    id UUID PRIMARY KEY,
    fixture_id UUID NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
    result_submission_id UUID REFERENCES result_submissions(id) ON DELETE SET NULL,
    registration_id UUID NOT NULL REFERENCES tournament_registrations(id),
    opened_by UUID NOT NULL REFERENCES app_users(id),
    category VARCHAR(120) NOT NULL,
    description VARCHAR(5000) NOT NULL,
    status VARCHAR(20) NOT NULL,
    assigned_to UUID REFERENCES app_users(id),
    resolution VARCHAR(5000),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE dispute_comments (
    id UUID PRIMARY KEY,
    dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES app_users(id),
    message VARCHAR(3000) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_penalties_tournament_status
    ON penalties(tournament_id, status);
CREATE INDEX idx_disputes_tournament_status
    ON disputes(fixture_id, status);
