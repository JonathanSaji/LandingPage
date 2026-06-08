-- Links PhotoSync albums to TravelSync trips.
-- Depends on: public.accounts, "TravelSync".trips (both already exist).
-- Safe to run multiple times (IF NOT EXISTS throughout).

CREATE TABLE IF NOT EXISTS photo_albums (
  id          BIGSERIAL   PRIMARY KEY,
  account_id  BIGINT      NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  trip_id     BIGINT      REFERENCES "TravelSync".trips(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS photos (
  id          BIGSERIAL   PRIMARY KEY,
  album_id    BIGINT      NOT NULL REFERENCES photo_albums(id) ON DELETE CASCADE,
  account_id  BIGINT      NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  storage_url TEXT        NOT NULL,
  taken_at    TIMESTAMPTZ,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_photo_albums_account ON photo_albums(account_id);
CREATE INDEX IF NOT EXISTS idx_photo_albums_trip    ON photo_albums(trip_id);
CREATE INDEX IF NOT EXISTS idx_photos_album_id      ON photos(album_id);
