CREATE TABLE registration_form_fields (
    id UUID PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    field_key VARCHAR(80) NOT NULL,
    label VARCHAR(160) NOT NULL,
    type VARCHAR(30) NOT NULL,
    help_text VARCHAR(500),
    placeholder VARCHAR(255),
    required BOOLEAN NOT NULL DEFAULT FALSE,
    validation_pattern VARCHAR(500),
    minimum_length INTEGER,
    maximum_length INTEGER,
    sort_order INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_registration_field_key UNIQUE (tournament_id, field_key)
);

CREATE TABLE registration_form_field_options (
    field_id UUID NOT NULL REFERENCES registration_form_fields(id) ON DELETE CASCADE,
    option_order INTEGER NOT NULL,
    option_value VARCHAR(255) NOT NULL,
    PRIMARY KEY (field_id, option_order)
);

CREATE INDEX idx_registration_form_order
    ON registration_form_fields(tournament_id, sort_order);
