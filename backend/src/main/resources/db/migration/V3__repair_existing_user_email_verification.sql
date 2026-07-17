-- Existing databases may have been baseline-marked before V2 was introduced.
-- Keep this migration idempotent so it repairs those databases safely.
ALTER TABLE IF EXISTS app_users
    ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;
