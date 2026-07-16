CREATE TABLE stage_qualifications (
    id UUID PRIMARY KEY,
    from_stage_id UUID NOT NULL REFERENCES tournament_stages(id) ON DELETE CASCADE,
    to_stage_id UUID NOT NULL REFERENCES tournament_stages(id) ON DELETE CASCADE,
    source_group_id UUID REFERENCES stage_groups(id) ON DELETE SET NULL,
    registration_id UUID NOT NULL REFERENCES tournament_registrations(id),
    source_rank INTEGER NOT NULL,
    manual BOOLEAN NOT NULL DEFAULT FALSE,
    qualified_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_stage_qualification UNIQUE (from_stage_id, registration_id)
);

CREATE INDEX idx_stage_qualifications_to_stage
    ON stage_qualifications(to_stage_id, source_rank);
