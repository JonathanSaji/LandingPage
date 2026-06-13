-- Migration 002: Link seatsync schema to public.accounts via account_id
-- Corrected for actual schema: companies.id is VARCHAR, not BIGINT

-- ─────────────────────────────────────────────────────────────
-- 1. Add account_id to seatsync_membership
-- ─────────────────────────────────────────────────────────────
ALTER TABLE seatsync.seatsync_membership
  ADD COLUMN IF NOT EXISTS account_id BIGINT REFERENCES public.accounts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_seatsync_membership_account_id
  ON seatsync.seatsync_membership(account_id);

-- ─────────────────────────────────────────────────────────────
-- 2. Add owner_account_id to seatsync.companies
-- ─────────────────────────────────────────────────────────────
ALTER TABLE seatsync.companies
  ADD COLUMN IF NOT EXISTS owner_account_id BIGINT REFERENCES public.accounts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_seatsync_companies_owner_account_id
  ON seatsync.companies(owner_account_id);

-- ─────────────────────────────────────────────────────────────
-- 3. Create invite_codes table
--    company_id is VARCHAR to match seatsync.companies.id
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seatsync.invite_codes (
  id          BIGSERIAL PRIMARY KEY,
  company_id  VARCHAR NOT NULL REFERENCES seatsync.companies(id) ON DELETE CASCADE,
  code        TEXT NOT NULL UNIQUE,
  role        TEXT NOT NULL CHECK (role IN ('ADMIN', 'EMPLOYEE')),
  created_by  BIGINT REFERENCES public.accounts(id) ON DELETE SET NULL,
  used_by     BIGINT REFERENCES public.accounts(id) ON DELETE SET NULL,
  used_at     TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invite_codes_company_id
  ON seatsync.invite_codes(company_id);

-- ─────────────────────────────────────────────────────────────
-- 4. Backfill account_id on seatsync_membership
--    Match by email (most reliable field)
-- ─────────────────────────────────────────────────────────────
UPDATE seatsync.seatsync_membership sm
SET account_id = a.id
FROM public.accounts a
WHERE LOWER(sm.email) = LOWER(a.email)
  AND sm.account_id IS NULL;

-- ─────────────────────────────────────────────────────────────
-- 5. Backfill owner_account_id on seatsync.companies
-- ─────────────────────────────────────────────────────────────
UPDATE seatsync.companies c
SET owner_account_id = a.id
FROM public.accounts a
WHERE LOWER(c.owner_email) = LOWER(a.email)
  AND c.owner_account_id IS NULL;
