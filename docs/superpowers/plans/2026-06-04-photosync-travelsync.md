# PhotoSync ↔ TravelSync: Trip Memory Albums — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Link a PhotoSync album to a TravelSync trip so the trip displays a day-by-day photo timeline in a Memories tab.

**Architecture:** Shared Neon PostgreSQL database is the bridge — `photo_albums.trip_id` FK is the only cross-app link. TravelSync reads PhotoSync's tables directly via DB queries. No cross-app API calls.

**Tech Stack:** Next.js 15, TypeScript, `pg` (node-postgres), `exifr` (EXIF metadata), Tailwind CSS / Framer Motion (match each app's existing style)

> **Repo labels:** Each task is marked with which repo it belongs to.
> - 🏠 **Landing Page repo** — `LandingPage/`
> - ✈️ **TravelSync repo**
> - 📷 **PhotoSync repo**

---

## File Structure

### 🏠 Landing Page repo
| File | Action | Purpose |
|------|--------|---------|
| `src/lib/server/migrations/001_trips_photo_albums_photos.sql` | Create | SQL to create the 3 new tables |
| `src/scripts/migrate.ts` | Create | One-shot migration runner |

### ✈️ TravelSync repo
| File | Action | Purpose |
|------|--------|---------|
| `src/lib/db.ts` | Create | Shared pg pool (same pattern as landing page) |
| `src/lib/trips.ts` | Create | DB queries: get trip, get trip photos |
| `src/lib/groupPhotos.ts` | Create | Pure fn: group photos array into day buckets |
| `src/components/memories/PhotoTimeline.tsx` | Create | Day-separated photo grid |
| `src/components/memories/MemoriesTab.tsx` | Create | Fetches photos, renders timeline or empty state |
| `src/app/api/trips/[id]/photos/route.ts` | Create | GET endpoint — returns photos for a trip |

### 📷 PhotoSync repo
| File | Action | Purpose |
|------|--------|---------|
| `src/lib/db.ts` | Create | Shared pg pool |
| `src/lib/albums.ts` | Create | DB queries: getTripsForUser, createAlbum |
| `src/lib/extractTakenAt.ts` | Create | Pure fn: parse EXIF DateTimeOriginal from a File |
| `src/lib/photos.ts` | Create | DB query: insertPhoto |
| `src/components/albums/NewAlbumModal.tsx` | Create | Create album UI with optional trip-link toggle |
| `src/app/api/albums/route.ts` | Create | POST /api/albums — creates album row |
| `src/app/api/photos/route.ts` | Create | POST /api/photos — uploads photo + saves row with taken_at |

---

## Part A — Database Migrations (🏠 Landing Page repo)

### Task 1: Write and run the migration SQL

**Files:**
- Create: `src/lib/server/migrations/001_trips_photo_albums_photos.sql`
- Create: `src/scripts/migrate.ts`

- [ ] **Step 1: Create the SQL migration file**

```sql
-- src/lib/server/migrations/001_trips_photo_albums_photos.sql

CREATE TABLE IF NOT EXISTS trips (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  TEXT        NOT NULL,
  title       TEXT        NOT NULL,
  destination TEXT        NOT NULL,
  start_date  DATE        NOT NULL,
  end_date    DATE        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS photo_albums (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  TEXT        NOT NULL,
  name        TEXT        NOT NULL,
  trip_id     UUID        REFERENCES trips(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS photos (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id    UUID        NOT NULL REFERENCES photo_albums(id) ON DELETE CASCADE,
  account_id  TEXT        NOT NULL,
  storage_url TEXT        NOT NULL,
  taken_at    TIMESTAMPTZ,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trips_account_id    ON trips(account_id);
CREATE INDEX IF NOT EXISTS idx_photo_albums_trip   ON photo_albums(trip_id);
CREATE INDEX IF NOT EXISTS idx_photos_album_id     ON photos(album_id);
```

- [ ] **Step 2: Create the migration runner script**

```typescript
// src/scripts/migrate.ts
import { Pool } from "pg";
import { readFileSync } from "fs";
import { join } from "path";

async function migrate() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const sql = readFileSync(
    join(__dirname, "../lib/server/migrations/001_trips_photo_albums_photos.sql"),
    "utf8"
  );
  await pool.query(sql);
  console.log("Migration complete.");
  await pool.end();
}

migrate().catch((err) => { console.error(err); process.exit(1); });
```

- [ ] **Step 3: Run the migration**

```bash
npx tsx src/scripts/migrate.ts
```

Expected output: `Migration complete.`

- [ ] **Step 4: Verify tables exist in Neon console**

Log into https://console.neon.tech, open your database, and confirm `trips`, `photo_albums`, and `photos` tables appear.

- [ ] **Step 5: Commit**

```bash
git add src/lib/server/migrations/001_trips_photo_albums_photos.sql src/scripts/migrate.ts
git commit -m "feat: add trips, photo_albums, photos migration"
```

---

## Part B — TravelSync (✈️ TravelSync repo)

> Adapt file paths to your actual TravelSync repo structure. If it already has a `src/lib/db.ts`, skip Task 2 and use the existing pool.

### Task 2: DB client

**Files:**
- Create: `src/lib/db.ts`

- [ ] **Step 1: Install pg if not present**

```bash
npm install pg
npm install --save-dev @types/pg
```

- [ ] **Step 2: Create the DB pool**

```typescript
// src/lib/db.ts
import { Pool, type PoolClient, type QueryResultRow } from "pg";

let pool: Pool | undefined;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL is not configured.");
    pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

export async function dbQuery<T extends QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await getPool().query<T>(text, params);
  return result.rows;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/db.ts
git commit -m "feat: add db client"
```

---

### Task 3: Trip photo queries

**Files:**
- Create: `src/lib/trips.ts`

- [ ] **Step 1: Write the queries**

```typescript
// src/lib/trips.ts
import { dbQuery } from "./db";

export interface TripPhoto {
  id: string;
  storage_url: string;
  taken_at: string | null;
  uploaded_at: string;
}

export interface LinkedAlbum {
  id: string;
  name: string;
}

export async function getTripLinkedAlbum(
  tripId: string,
  accountId: string
): Promise<LinkedAlbum | null> {
  const rows = await dbQuery<LinkedAlbum>(
    `SELECT id, name FROM photo_albums
     WHERE trip_id = $1 AND account_id = $2
     LIMIT 1`,
    [tripId, accountId]
  );
  return rows[0] ?? null;
}

export async function getTripPhotos(
  tripId: string,
  accountId: string
): Promise<TripPhoto[]> {
  return dbQuery<TripPhoto>(
    `SELECT p.id, p.storage_url, p.taken_at, p.uploaded_at
     FROM photos p
     JOIN photo_albums a ON p.album_id = a.id
     WHERE a.trip_id = $1 AND p.account_id = $2
     ORDER BY COALESCE(p.taken_at, p.uploaded_at) ASC`,
    [tripId, accountId]
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/trips.ts
git commit -m "feat: add trip photo queries"
```

---

### Task 4: groupPhotosByDay pure function + tests

**Files:**
- Create: `src/lib/groupPhotos.ts`
- Create: `src/lib/groupPhotos.test.ts`

- [ ] **Step 1: Install a test runner if not present**

```bash
npm install --save-dev vitest
```

Add to `package.json` scripts: `"test": "vitest run"`

- [ ] **Step 2: Write the failing test**

```typescript
// src/lib/groupPhotos.test.ts
import { describe, it, expect } from "vitest";
import { groupPhotosByDay } from "./groupPhotos";

const makePhoto = (id: string, taken_at: string | null, uploaded_at: string) => ({
  id, storage_url: "https://example.com/photo.jpg", taken_at, uploaded_at,
});

describe("groupPhotosByDay", () => {
  it("groups photos by taken_at date", () => {
    const photos = [
      makePhoto("1", "2024-06-03T10:00:00Z", "2024-06-10T00:00:00Z"),
      makePhoto("2", "2024-06-03T14:00:00Z", "2024-06-10T00:00:00Z"),
      makePhoto("3", "2024-06-04T09:00:00Z", "2024-06-10T00:00:00Z"),
    ];
    const groups = groupPhotosByDay(photos, "2024-06-03");
    expect(groups).toHaveLength(2);
    expect(groups[0].photos).toHaveLength(2);
    expect(groups[1].photos).toHaveLength(1);
  });

  it("labels days relative to trip start", () => {
    const photos = [makePhoto("1", "2024-06-05T10:00:00Z", "2024-06-10T00:00:00Z")];
    const groups = groupPhotosByDay(photos, "2024-06-03");
    expect(groups[0].label).toBe("Day 3 · June 5");
  });

  it("falls back to uploaded_at when taken_at is null", () => {
    const photos = [makePhoto("1", null, "2024-06-03T10:00:00Z")];
    const groups = groupPhotosByDay(photos, "2024-06-03");
    expect(groups).toHaveLength(1);
    expect(groups[0].photos[0].id).toBe("1");
  });

  it("returns empty array for no photos", () => {
    expect(groupPhotosByDay([], "2024-06-03")).toEqual([]);
  });
});
```

- [ ] **Step 3: Run test to confirm it fails**

```bash
npm test
```

Expected: FAIL — `groupPhotosByDay` not found.

- [ ] **Step 4: Implement groupPhotosByDay**

```typescript
// src/lib/groupPhotos.ts
import type { TripPhoto } from "./trips";

export interface DayGroup {
  date: string;   // "2024-06-03"
  label: string;  // "Day 1 · June 3"
  photos: TripPhoto[];
}

export function groupPhotosByDay(photos: TripPhoto[], tripStartDate: string): DayGroup[] {
  if (photos.length === 0) return [];

  const groups = new Map<string, TripPhoto[]>();

  for (const photo of photos) {
    const raw = photo.taken_at ?? photo.uploaded_at;
    const dateKey = new Date(raw).toISOString().split("T")[0];
    if (!groups.has(dateKey)) groups.set(dateKey, []);
    groups.get(dateKey)!.push(photo);
  }

  const start = new Date(tripStartDate + "T00:00:00Z");

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, photos]) => {
      const d = new Date(date + "T00:00:00Z");
      const dayNum = Math.round((d.getTime() - start.getTime()) / 86_400_000) + 1;
      const label = `Day ${dayNum} · ${d.toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" })}`;
      return { date, label, photos };
    });
}
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
npm test
```

Expected: All 4 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/groupPhotos.ts src/lib/groupPhotos.test.ts
git commit -m "feat: add groupPhotosByDay with tests"
```

---

### Task 5: GET /api/trips/[id]/photos route

**Files:**
- Create: `src/app/api/trips/[id]/photos/route.ts`

- [ ] **Step 1: Create the API route**

```typescript
// src/app/api/trips/[id]/photos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getTripPhotos, getTripLinkedAlbum } from "@/lib/trips";

function getAccountId(req: NextRequest): string | null {
  const token = req.cookies.get("subsync_token")?.value
    ?? req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  try {
    return JSON.parse(atob(token)).accountId ?? null;
  } catch {
    return null;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const accountId = getAccountId(req);
  if (!accountId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [album, photos] = await Promise.all([
    getTripLinkedAlbum(params.id, accountId),
    getTripPhotos(params.id, accountId),
  ]);

  return NextResponse.json({ album, photos });
}
```

- [ ] **Step 2: Test the endpoint manually**

With the dev server running and a valid `subsync_token` in your browser cookies:

```
GET http://localhost:3000/api/trips/some-trip-uuid/photos
```

Expected: `{ "album": null, "photos": [] }` (empty since no data yet — confirms the route works without crashing)

- [ ] **Step 3: Commit**

```bash
git add src/app/api/trips/[id]/photos/route.ts
git commit -m "feat: add GET /api/trips/[id]/photos route"
```

---

### Task 6: PhotoTimeline component

**Files:**
- Create: `src/components/memories/PhotoTimeline.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/memories/PhotoTimeline.tsx
"use client";

import Image from "next/image";
import { groupPhotosByDay } from "@/lib/groupPhotos";
import type { TripPhoto } from "@/lib/trips";

interface Props {
  photos: TripPhoto[];
  tripStartDate: string;
}

export function PhotoTimeline({ photos, tripStartDate }: Props) {
  const allHaveDates = photos.every((p) => p.taken_at !== null);
  const groups = allHaveDates
    ? groupPhotosByDay(photos, tripStartDate)
    : [{ date: "", label: "", photos }];

  if (!allHaveDates) {
    // Flat grid fallback
    return (
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo) => (
          <PhotoThumb key={photo.id} photo={photo} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <div key={group.date}>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">
            {group.label}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {group.photos.map((photo) => (
              <PhotoThumb key={photo.id} photo={photo} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PhotoThumb({ photo }: { photo: TripPhoto }) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-lg bg-white/5">
      <Image
        src={photo.storage_url}
        alt=""
        fill
        className="object-cover"
        sizes="(max-width: 768px) 33vw, 200px"
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/memories/PhotoTimeline.tsx
git commit -m "feat: add PhotoTimeline component"
```

---

### Task 7: MemoriesTab component

**Files:**
- Create: `src/components/memories/MemoriesTab.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/memories/MemoriesTab.tsx
"use client";

import { useEffect, useState } from "react";
import { PhotoTimeline } from "./PhotoTimeline";
import type { TripPhoto, LinkedAlbum } from "@/lib/trips";

interface Props {
  tripId: string;
  tripStartDate: string; // "YYYY-MM-DD"
}

export function MemoriesTab({ tripId, tripStartDate }: Props) {
  const [photos, setPhotos]   = useState<TripPhoto[]>([]);
  const [album, setAlbum]     = useState<LinkedAlbum | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/trips/${tripId}/photos`)
      .then((r) => r.json())
      .then(({ photos, album }) => {
        setPhotos(photos ?? []);
        setAlbum(album ?? null);
      })
      .finally(() => setLoading(false));
  }, [tripId]);

  if (loading) {
    return <p className="text-sm text-white/40 py-8 text-center">Loading memories…</p>;
  }

  if (!album) {
    return (
      <div className="py-12 text-center">
        <p className="text-white/40 text-sm">No photo album linked to this trip.</p>
        <p className="text-white/25 text-xs mt-1">
          Open PhotoSync, create an album, and link it to this trip.
        </p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-white/40 text-sm">"{album.name}" is linked but has no photos yet.</p>
        <p className="text-white/25 text-xs mt-1">Upload photos in PhotoSync to see them here.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-white/30 mb-4">{album.name} · {photos.length} photos</p>
      <PhotoTimeline photos={photos} tripStartDate={tripStartDate} />
    </div>
  );
}
```

- [ ] **Step 2: Wire MemoriesTab into your trip detail page**

In whatever component renders a single trip (e.g. `src/app/trips/[id]/page.tsx`), add:

```tsx
import { MemoriesTab } from "@/components/memories/MemoriesTab";

// Inside the trip detail render, add a "Memories" tab section:
<MemoriesTab tripId={trip.id} tripStartDate={trip.start_date} />
```

- [ ] **Step 3: Start dev server and verify**

```bash
npm run dev
```

Open a trip detail page. You should see the Memories tab with the "No photo album linked" empty state. No errors in console.

- [ ] **Step 4: Commit**

```bash
git add src/components/memories/MemoriesTab.tsx
git commit -m "feat: add MemoriesTab with empty states"
```

---

## Part C — PhotoSync (📷 PhotoSync repo)

### Task 8: DB client + album queries

**Files:**
- Create: `src/lib/db.ts`
- Create: `src/lib/albums.ts`

- [ ] **Step 1: Create db.ts (identical pattern to TravelSync)**

```typescript
// src/lib/db.ts
import { Pool, type QueryResultRow } from "pg";

let pool: Pool | undefined;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL is not configured.");
    pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

export async function dbQuery<T extends QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await getPool().query<T>(text, params);
  return result.rows;
}
```

- [ ] **Step 2: Create album queries**

```typescript
// src/lib/albums.ts
import { dbQuery } from "./db";

export interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
}

export interface Album {
  id: string;
  name: string;
  trip_id: string | null;
}

export async function getTripsForUser(accountId: string): Promise<Trip[]> {
  return dbQuery<Trip>(
    `SELECT id, title, destination, start_date, end_date
     FROM trips
     WHERE account_id = $1
     ORDER BY start_date DESC`,
    [accountId]
  );
}

export async function createAlbum(
  accountId: string,
  name: string,
  tripId: string | null
): Promise<Album> {
  const rows = await dbQuery<Album>(
    `INSERT INTO photo_albums (account_id, name, trip_id)
     VALUES ($1, $2, $3)
     RETURNING id, name, trip_id`,
    [accountId, name, tripId]
  );
  return rows[0];
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/db.ts src/lib/albums.ts
git commit -m "feat: add db client and album queries"
```

---

### Task 9: EXIF extraction + tests

**Files:**
- Create: `src/lib/extractTakenAt.ts`
- Create: `src/lib/extractTakenAt.test.ts`

- [ ] **Step 1: Install exifr**

```bash
npm install exifr
```

- [ ] **Step 2: Write the failing test**

```typescript
// src/lib/extractTakenAt.test.ts
import { describe, it, expect } from "vitest";
import { extractTakenAt } from "./extractTakenAt";

describe("extractTakenAt", () => {
  it("returns null for a plain buffer with no EXIF", async () => {
    const buf = Buffer.from("not an image");
    const result = await extractTakenAt(buf);
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 3: Run test to confirm it fails**

```bash
npm test
```

Expected: FAIL — `extractTakenAt` not found.

- [ ] **Step 4: Implement extractTakenAt**

```typescript
// src/lib/extractTakenAt.ts
import exifr from "exifr";

export async function extractTakenAt(input: Buffer | File): Promise<Date | null> {
  try {
    const data = await exifr.parse(input, ["DateTimeOriginal", "CreateDate"]);
    const raw = data?.DateTimeOriginal ?? data?.CreateDate;
    if (!raw) return null;
    const d = raw instanceof Date ? raw : new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}
```

- [ ] **Step 5: Run tests**

```bash
npm test
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/extractTakenAt.ts src/lib/extractTakenAt.test.ts
git commit -m "feat: add EXIF date extraction with tests"
```

---

### Task 10: Photo insert query

**Files:**
- Create: `src/lib/photos.ts`

- [ ] **Step 1: Create the query**

```typescript
// src/lib/photos.ts
import { dbQuery } from "./db";

export interface Photo {
  id: string;
  storage_url: string;
  taken_at: string | null;
}

export async function insertPhoto(
  albumId: string,
  accountId: string,
  storageUrl: string,
  takenAt: Date | null
): Promise<Photo> {
  const rows = await dbQuery<Photo>(
    `INSERT INTO photos (album_id, account_id, storage_url, taken_at)
     VALUES ($1, $2, $3, $4)
     RETURNING id, storage_url, taken_at`,
    [albumId, accountId, storageUrl, takenAt ?? null]
  );
  return rows[0];
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/photos.ts
git commit -m "feat: add photo insert query"
```

---

### Task 11: POST /api/albums route

**Files:**
- Create: `src/app/api/albums/route.ts`

- [ ] **Step 1: Create the route**

```typescript
// src/app/api/albums/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAlbum } from "@/lib/albums";

function getAccountId(req: NextRequest): string | null {
  const token = req.cookies.get("subsync_token")?.value
    ?? req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  try { return JSON.parse(atob(token)).accountId ?? null; }
  catch { return null; }
}

export async function POST(req: NextRequest) {
  const accountId = getAccountId(req);
  if (!accountId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, tripId } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const album = await createAlbum(accountId, name.trim(), tripId ?? null);
  return NextResponse.json({ ok: true, album }, { status: 201 });
}
```

- [ ] **Step 2: Test manually with curl**

```bash
curl -X POST http://localhost:3000/api/albums \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_subsync_token>" \
  -d '{"name":"Paris Trip Photos","tripId":null}'
```

Expected: `{"ok":true,"album":{"id":"...","name":"Paris Trip Photos","trip_id":null}}`

- [ ] **Step 3: Commit**

```bash
git add src/app/api/albums/route.ts
git commit -m "feat: add POST /api/albums route"
```

---

### Task 12: POST /api/photos route

**Files:**
- Create: `src/app/api/photos/route.ts`

> This route expects `multipart/form-data` with a `file` field and an `albumId` field. Storage is handled by saving to wherever PhotoSync stores files (adapt `storageUrl` to your actual storage — local filesystem for dev, S3/Cloudflare R2 for production).

- [ ] **Step 1: Create the route**

```typescript
// src/app/api/photos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { extractTakenAt } from "@/lib/extractTakenAt";
import { insertPhoto } from "@/lib/photos";

function getAccountId(req: NextRequest): string | null {
  const token = req.cookies.get("subsync_token")?.value
    ?? req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  try { return JSON.parse(atob(token)).accountId ?? null; }
  catch { return null; }
}

export async function POST(req: NextRequest) {
  const accountId = getAccountId(req);
  if (!accountId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const albumId = form.get("albumId") as string | null;

  if (!file || !albumId) {
    return NextResponse.json({ error: "file and albumId are required" }, { status: 400 });
  }

  // Read file buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Extract EXIF date
  const takenAt = await extractTakenAt(buffer);

  // Save file locally (adapt this for your storage solution)
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const uploadDir = join(process.cwd(), "public", "uploads");
  await writeFile(join(uploadDir, filename), buffer);
  const storageUrl = `/uploads/${filename}`;

  const photo = await insertPhoto(albumId, accountId, storageUrl, takenAt);
  return NextResponse.json({ ok: true, photo }, { status: 201 });
}
```

- [ ] **Step 2: Create the uploads directory**

```bash
mkdir -p public/uploads
echo "uploads/" >> .gitignore
```

- [ ] **Step 3: Test manually**

```bash
curl -X POST http://localhost:3000/api/photos \
  -H "Authorization: Bearer <your_subsync_token>" \
  -F "albumId=<album-uuid>" \
  -F "file=@/path/to/test-photo.jpg"
```

Expected: `{"ok":true,"photo":{"id":"...","storage_url":"/uploads/...","taken_at":"..."}}`

- [ ] **Step 4: Commit**

```bash
git add src/app/api/photos/route.ts
git commit -m "feat: add POST /api/photos route with EXIF extraction"
```

---

### Task 13: NewAlbumModal with trip-link toggle

**Files:**
- Create: `src/components/albums/NewAlbumModal.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/albums/NewAlbumModal.tsx
"use client";

import { useState, useEffect } from "react";
import type { Trip } from "@/lib/albums";

interface Props {
  onClose: () => void;
  onCreated: (albumId: string) => void;
}

function getAccountId(): string | null {
  try {
    const token = localStorage.getItem("subsync_token");
    if (!token) return null;
    return JSON.parse(atob(token)).accountId ?? null;
  } catch { return null; }
}

export function NewAlbumModal({ onClose, onCreated }: Props) {
  const [name, setName]         = useState("");
  const [linkTrip, setLinkTrip] = useState(false);
  const [trips, setTrips]       = useState<Trip[]>([]);
  const [tripId, setTripId]     = useState<string>("");
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (!linkTrip) return;
    fetch("/api/trips")
      .then((r) => r.json())
      .then((data) => setTrips(data.trips ?? []));
  }, [linkTrip]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    const token = localStorage.getItem("subsync_token");
    const res = await fetch("/api/albums", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: name.trim(), tripId: linkTrip ? tripId || null : null }),
    });

    const data = await res.json();
    setLoading(false);
    if (data.ok) onCreated(data.album.id);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <form
        onSubmit={handleSubmit}
        className="bg-neutral-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4"
      >
        <h2 className="text-white font-bold text-lg">New Album</h2>

        <input
          type="text"
          placeholder="Album name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-white/30"
          required
        />

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={linkTrip}
            onChange={(e) => setLinkTrip(e.target.checked)}
            className="accent-yellow-400"
          />
          <span className="text-white/70 text-sm">Link to a TravelSync trip</span>
        </label>

        {linkTrip && (
          <select
            value={tripId}
            onChange={(e) => setTripId(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm outline-none"
          >
            <option value="">— Select a trip —</option>
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} · {t.destination}
              </option>
            ))}
          </select>
        )}

        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-white/40 text-sm hover:text-white/70"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="px-5 py-2 rounded-xl bg-yellow-400 text-black text-sm font-bold disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Add GET /api/trips route in PhotoSync so the dropdown can fetch trips**

```typescript
// src/app/api/trips/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getTripsForUser } from "@/lib/albums";

function getAccountId(req: NextRequest): string | null {
  const token = req.cookies.get("subsync_token")?.value
    ?? req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  try { return JSON.parse(atob(token)).accountId ?? null; }
  catch { return null; }
}

export async function GET(req: NextRequest) {
  const accountId = getAccountId(req);
  if (!accountId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const trips = await getTripsForUser(accountId);
  return NextResponse.json({ trips });
}
```

- [ ] **Step 3: Wire NewAlbumModal into your PhotoSync albums page**

Add a "New Album" button to your albums index page that renders `<NewAlbumModal>` on click.

- [ ] **Step 4: Start dev server and smoke test the full flow**

1. Open PhotoSync, click "New Album"
2. Enter a name, enable "Link to a TravelSync trip"
3. Confirm the dropdown populates with your trips from TravelSync
4. Create the album — confirm it appears in your albums list
5. Open TravelSync, navigate to that trip's Memories tab
6. Confirm it shows the album name and "no photos yet" state

- [ ] **Step 5: Commit**

```bash
git add src/components/albums/NewAlbumModal.tsx src/app/api/trips/route.ts
git commit -m "feat: add NewAlbumModal with TravelSync trip linking"
```

---

## End-to-End Smoke Test

Once all tasks are complete, run through this full flow:

1. **Create a trip in TravelSync** — title "Rome Trip", June 1–7
2. **Open PhotoSync** → New Album → "Rome Photos" → Link to Trip → select "Rome Trip" → Create
3. **Upload a photo** (with a camera-taken JPEG that has EXIF data) to the "Rome Photos" album
4. **Open TravelSync** → Rome Trip → Memories tab
5. Confirm: photo appears, grouped under "Day N · June X" based on EXIF date
6. **Upload a screenshot** (no EXIF) to the same album
7. Confirm: TravelSync falls back to flat grid (no day headers)
