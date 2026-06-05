# PhotoSync ↔ TravelSync: Trip Memory Albums

**Date:** 2026-06-04  
**Status:** Approved  
**Scope:** Cross-app photo linking between PhotoSync and TravelSync via shared Neon database

---

## Overview

When a user creates a photo album in PhotoSync, they can link it to a past trip from TravelSync. Once linked, the trip in TravelSync gains a **Memories** tab that displays all photos from that album in a day-by-day timeline. Photos are automatically grouped by the date they were taken (via EXIF metadata), with a flat grid fallback if date data is unavailable.

---

## Data Model

Three new tables in the shared Neon PostgreSQL database.

### `trips` — owned by TravelSync

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | Primary key |
| `account_id` | `text` | Matches `subsync_token` accountId |
| `title` | `text` | e.g. "Paris Trip" |
| `destination` | `text` | e.g. "Paris, France" |
| `start_date` | `date` | |
| `end_date` | `date` | |
| `created_at` | `timestamptz` | |

### `photo_albums` — owned by PhotoSync

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | Primary key |
| `account_id` | `text` | |
| `name` | `text` | e.g. "Paris Trip Photos" |
| `trip_id` | `uuid` | Nullable FK → `trips.id` |
| `created_at` | `timestamptz` | |

### `photos` — owned by PhotoSync

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | Primary key |
| `album_id` | `uuid` | FK → `photo_albums.id` |
| `account_id` | `text` | |
| `storage_url` | `text` | URL to the stored image file |
| `taken_at` | `timestamptz` | Nullable — populated from EXIF `DateTimeOriginal` |
| `uploaded_at` | `timestamptz` | Always present — fallback ordering |

The entire cross-app link is `photo_albums.trip_id`. One album per trip. No junction table needed.

---

## PhotoSync Flow: Creating a Linked Album

1. User taps **New Album**
2. Names the album
3. A **"Link to Trip"** toggle appears
4. When enabled: fetch `SELECT * FROM trips WHERE account_id = ? ORDER BY start_date DESC` and render as a dropdown
5. User selects a trip → `photo_albums.trip_id` is set on save
6. All photos subsequently uploaded to this album are automatically part of the linked trip — no per-photo action required

**EXIF extraction on upload:**  
When a photo is uploaded, PhotoSync attempts to read `DateTimeOriginal` from image metadata and stores it as `taken_at`. If the field is absent (screenshot, edited image, no metadata), `taken_at` is stored as `null`. TravelSync uses `uploaded_at` as the fallback ordering key.

---

## TravelSync Flow: Memory Album View

A **Memories** tab appears on any trip that has a linked album (`photo_albums.trip_id = trip.id`).

**If no album is linked:**  
Show a prompt: *"Link a PhotoSync album to see your trip photos here."*

**If an album is linked:**

Fetch photos with:
```sql
SELECT photos.*
FROM photos
JOIN photo_albums ON photos.album_id = photo_albums.id
WHERE photo_albums.trip_id = :tripId
  AND photos.account_id = :accountId
ORDER BY COALESCE(taken_at, uploaded_at) ASC
```

Group by date (`taken_at::date` if available, else `uploaded_at::date`) and render a timeline:

```
Day 1 · June 3
  [ photo ] [ photo ] [ photo ]

Day 2 · June 4
  [ photo ] [ photo ]
```

Tapping a photo opens a full-screen view.

**Fallback (Option A):**  
If every photo in the album has `taken_at = null`, skip day headers entirely and render a flat chronological grid ordered by `uploaded_at`.

---

## Architecture

- **Approach:** Shared Neon PostgreSQL database (both apps share the same `DATABASE_URL`)
- **Auth:** Shared `subsync_token` JWT in `localStorage` — `accountId` is the user identifier across both apps
- **No cross-app API calls** — TravelSync reads PhotoSync's tables directly via DB queries
- **No real-time sync needed** — TravelSync fetches photos on each page load

---

## Out of Scope

- Multiple albums per trip
- Removing or re-linking an album after creation
- Sharing trip memories with other users
- Video support
