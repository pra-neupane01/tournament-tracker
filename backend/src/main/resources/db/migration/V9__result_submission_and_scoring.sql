CREATE TABLE metric_scoring_rules (
    id UUID PRIMARY KEY,
    stage_id UUID NOT NULL REFERENCES tournament_stages(id) ON DELETE CASCADE,
    metric_key VARCHAR(80) NOT NULL,
    label VARCHAR(120) NOT NULL,
    points_per_unit NUMERIC(12, 4) NOT NULL,
    sort_order INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_stage_metric_key UNIQUE (stage_id, metric_key)
);

CREATE TABLE placement_scoring_rules (
    id UUID PRIMARY KEY,
    stage_id UUID NOT NULL REFERENCES tournament_stages(id) ON DELETE CASCADE,
    placement INTEGER NOT NULL,
    points NUMERIC(12, 4) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_stage_placement UNIQUE (stage_id, placement)
);

CREATE TABLE result_submissions (
    id UUID PRIMARY KEY,
    fixture_id UUID NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES app_users(id),
    status VARCHAR(20) NOT NULL,
    submitted_at TIMESTAMP NOT NULL,
    reviewed_by UUID REFERENCES app_users(id),
    reviewed_at TIMESTAMP,
    notes VARCHAR(2000),
    evidence_url VARCHAR(500),
    review_notes VARCHAR(2000),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE participant_results (
    id UUID PRIMARY KEY,
    submission_id UUID NOT NULL REFERENCES result_submissions(id) ON DELETE CASCADE,
    registration_id UUID NOT NULL REFERENCES tournament_registrations(id),
    placement INTEGER NOT NULL,
    total_points NUMERIC(14, 4) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_submission_registration UNIQUE (submission_id, registration_id)
);

CREATE TABLE result_metrics (
    id UUID PRIMARY KEY,
    participant_result_id UUID NOT NULL REFERENCES participant_results(id) ON DELETE CASCADE,
    metric_key VARCHAR(80) NOT NULL,
    metric_value NUMERIC(14, 4) NOT NULL,
    awarded_points NUMERIC(14, 4) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_participant_metric UNIQUE (participant_result_id, metric_key)
);

CREATE INDEX idx_result_submissions_fixture ON result_submissions(fixture_id, status);
CREATE INDEX idx_participant_results_submission ON participant_results(submission_id);
