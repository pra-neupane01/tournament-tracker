CREATE TABLE stored_files (
    id UUID PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES app_users(id),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    category VARCHAR(30) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    storage_key VARCHAR(500) NOT NULL UNIQUE,
    content_type VARCHAR(150) NOT NULL,
    size_bytes BIGINT NOT NULL,
    sha256 VARCHAR(64) NOT NULL,
    is_private BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE certificates (
    id UUID PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES app_users(id),
    registration_id UUID REFERENCES tournament_registrations(id) ON DELETE SET NULL,
    type VARCHAR(30) NOT NULL,
    title VARCHAR(180) NOT NULL,
    serial_number VARCHAR(80) NOT NULL UNIQUE,
    verification_code VARCHAR(100) NOT NULL UNIQUE,
    issued_at TIMESTAMP NOT NULL,
    issued_by UUID NOT NULL REFERENCES app_users(id),
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_stored_files_tournament ON stored_files(tournament_id);
CREATE INDEX idx_certificates_recipient ON certificates(recipient_id, issued_at);
