ALTER TABLE fixtures
    ADD COLUMN scheduled_at TIMESTAMP,
    ADD COLUMN duration_minutes INTEGER NOT NULL DEFAULT 60,
    ADD COLUMN check_in_opens_at TIMESTAMP,
    ADD COLUMN check_in_closes_at TIMESTAMP,
    ADD COLUMN venue VARCHAR(255),
    ADD COLUMN stream_url VARCHAR(500);

CREATE TABLE match_rooms (
    id UUID PRIMARY KEY,
    fixture_id UUID NOT NULL UNIQUE REFERENCES fixtures(id) ON DELETE CASCADE,
    room_code VARCHAR(120) NOT NULL,
    encrypted_password VARCHAR(1000),
    server_name VARCHAR(120),
    instructions VARCHAR(2000),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE fixture_check_ins (
    id UUID PRIMARY KEY,
    fixture_id UUID NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
    registration_id UUID NOT NULL REFERENCES tournament_registrations(id),
    checked_in_by UUID NOT NULL REFERENCES app_users(id),
    status VARCHAR(20) NOT NULL,
    checked_in_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_fixture_registration_check_in UNIQUE (fixture_id, registration_id)
);

CREATE INDEX idx_fixtures_schedule ON fixtures(scheduled_at);
CREATE INDEX idx_fixture_check_ins_fixture ON fixture_check_ins(fixture_id);
