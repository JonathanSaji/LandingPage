# PhotoSync Dashboard Integration

**Date:** 2026-06-08  
**Status:** Approved  
**Scope:** Connect PhotoSync data (photo thumbnails) into the SubSync dashboard tile and expanded modal

---

## Overview

The PhotoSync bento tile currently shows "COMING SOON." This integration replaces that placeholder with real data: a 3-photo thumbnail strip in the compact tile, and a flat 20-photo grid in the expanded modal. The `photos` and `photo_albums` tables are already migrated — only a new API route and UI changes are needed.

---

## Design Decisions

- **Tile content:** 3 most recent photo thumbnails (actual `<img>` elements), always 3 regardless of card size — photos scale up with the card
- **Modal content:** Flat grid of all 20 fetched photos, no album grouping
- **Data fetch:** Single API call at dashboard load (same as TravelSync, TrackerSync, etc.) — tile uses first 3, modal uses all 20

---

## Data Model

Existing tables — no migrations needed.

**`photos`** (public schema)

| Column | Type | Notes |
|--------|------|-------|
| `id` | `BIGSERIAL` | Primary key |
| `album_id` | `BIGINT` | FK → `photo_albums.id` |
| `account_id` | `BIGINT` | FK → `accounts.id` |
| `storage_url` | `TEXT` | URL to the stored image |
| `taken_at` | `TIMESTAMPTZ` | Nullable — from EXIF |
| `uploaded_at` | `TIMESTAMPTZ` | Always present — fallback ordering |

**`photo_albums`** (public schema)

| Column | Type | Notes |
|--------|------|-------|
| `id` | `BIGSERIAL` | Primary key |
| `account_id` | `BIGINT` | FK → `accounts.id` |
| `name` | `TEXT` | Album name |
| `trip_id` | `BIGINT` | Nullable FK → `TravelSync.trips.id` |
| `created_at` | `TIMESTAMPTZ` | |

---

## API Route

**`GET /api/photosync?userId=<id>`**

### Query

```sql
SELECT p.id, p.storage_url, p.taken_at, p.uploaded_at, pa.name AS album_name
FROM photos p
JOIN photo_albums pa ON p.album_id = pa.id
WHERE p.account_id = $1
ORDER BY COALESCE(p.taken_at, p.uploaded_at) DESC
LIMIT 20
```

### Response

```json
{ "ok": true, "photos": [{ "id", "storage_url", "taken_at", "uploaded_at", "album_name" }] }
```

### TypeScript interface (in dashboard page)

```ts
interface PhotoSyncPhoto {
  id: string;
  storage_url: string;
  taken_at: string | null;
  uploaded_at: string;
  album_name: string;
}
```

### Error handling

| Case | Response |
|------|----------|
| Missing `userId` | 400 `{ ok: false, error: "userId query parameter is required." }` |
| Invalid `userId` | 400 `{ ok: false, error: "Invalid userId parameter." }` |
| DB failure | 500 `{ ok: false, error: "Internal server error." }` |
| No photos | 200 `{ ok: true, photos: [] }` — empty state handled in UI |

The `userId === 999` dev alias swaps to the real `user1` account id, matching the trips route pattern.

---

## Dashboard Page Changes

### State

Add to the dashboard page state:

```ts
const [photoSyncPhotos, setPhotoSyncPhotos] = useState<PhotoSyncPhoto[]>([]);
```

### Fetch (alongside existing app fetches on mount)

```ts
const res = await fetch(`/api/photosync?userId=${userId}`);
const data = await res.json();
if (data.ok) setPhotoSyncPhotos(data.photos);
```

### Props threading

Pass `photoSyncPhotos` to both `BentoCard` and `ExpandedTile` as a new `photoSyncPhotos` prop (same pattern as `subscriptions`, `trips`, `fluencySessions`, etc.).

---

## BentoCard — PhotoSync Tile (Compact View)

Replaces the current "COMING SOON" branch for `tile.name === "PhotoSync"`.

**Label:** "Recent memories"

**Photo strip:** 3-column grid using the first 3 items in `photoSyncPhotos`. Each cell:
- `next/image` `<Image>` with `src={photo.storage_url}`
- Square aspect ratio, `rounded-lg`, `object-cover`
- Accent-tinted border: `border border-[#A259FF]/20`

**Caption below strip:** `"{n} recent photos · {photoSyncPhotos[0].album_name}"` where `n = photoSyncPhotos.length` (up to 20 — "recent" makes this accurate regardless of total library size).

**Photos scale with card size** — the 3-column grid fills available space naturally via CSS; no `isTall`/`isWide` branching needed.

**Loading state:** Same spinner pattern as other tiles, accent color `#A259FF`.

**Empty state:** Dashed border box matching TravelSync empty state:
```
No photos yet.
Ready to capture your first memory.
```

---

## ExpandedTile — PhotoSync Modal (Expanded View)

Replaces the "COMING SOON" branch for `tile.name === "PhotoSync"` in `ExpandedTile`.

**Section header:** "Recent photos" (replaces the generic "Current Data" label)

**Grid:** 4-column `<Image>` grid, all 20 photos from `photoSyncPhotos`. Each cell:
- `next/image` with `src={photo.storage_url}`
- Square aspect ratio, `rounded-xl`, `object-cover`
- Below each photo: album name + formatted date (`taken_at ?? uploaded_at`) in `text-[10px] text-white/40`

**Empty state:** Dashed border box:
```
No photos in PhotoSync yet.
```

**Bottom CTA banner:** Switches from "Launching Soon — Stay Tuned" to "Ecosystem Live — Syncing Data" — done by adding `"PhotoSync"` to the existing condition array on line ~1859 of `dashboard/page.tsx`.

---

## Out of Scope

- Clicking a photo to open full-screen view
- Filtering by album in the modal
- Showing the TravelSync trip link in the dashboard
- Upload or delete actions
- Pagination beyond the 20-photo limit
