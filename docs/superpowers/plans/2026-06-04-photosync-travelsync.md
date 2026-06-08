# PhotoSync ↔ TravelSync: Trip Memory Albums — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Link a PhotoSync album to a TravelSync trip so the trip displays a day-by-day photo timeline in a Memories tab.

**Architecture:** Shared Neon PostgreSQL database is the bridge — `"TravelSync".photo_albums.trip_id` FK is the only cross-app link. TravelSync reads PhotoSync's tables directly via DB queries. No cross-app API calls.

**Tech Stack:** Next.js 15/16, TypeScript, `pg` (node-postgres), `exifr` (EXIF metadata), Tailwind CSS v4 (match each app's existing style)

> **Repo labels:** Each task is marked with which repo it belongs to.
> - 🏠 **Landing Page repo** — `LandingPage/`
> - ✈️ **TravelSync repo**
> - 📷 **PhotoSync repo**

---

## ⚠️ Critical Context: How TravelSync Actually Works

Before implementing anything, read this section carefully. The TravelSync project differs significantly from a typical Next.js app.

### TravelSync project structure

TravelSync has **no `src/` directory**. All code lives at the project root:
```
lib/          ← utilities, DB queries, auth
app/          ← Next.js App Router (API routes, layout, page)
components/   ← React components
types/        ← TypeScript interfaces
```

### TravelSync database schema

TravelSync uses a **Postgres schema named `"TravelSync"`** (case-sensitive — must always be double-quoted in SQL). The existing tables are:

- **`"TravelSync".trips`** — trip rows, already created
  - `id BIGSERIAL PRIMARY KEY` — **integer, not UUID**
  - `owner_id BIGINT NOT NULL` references `public.accounts(id)`
  - `plan_details JSONB` — `{ name, location, dates, group, budget }` where `dates` is **free text** (e.g. "Aug 12–14"), not a DATE
  - `ideas JSONB` — array of IdeaItem
  - `itinerary JSONB` — GeneratedTrip (AI output)
  - `created_at, updated_at TIMESTAMPTZ`
- **`"TravelSync".trip_shares`** — collaborative access rows

User accounts live in **`public.accounts`** with `id BIGSERIAL`.

### TravelSync authentication

TravelSync has **no cookies, no JWTs, no `subsync_token`**. Auth works like this:

1. User logs in via `POST /api/auth/login` which queries `public.accounts`
2. On success, the client stores `{ id, username, displayName }` in **`localStorage`** under the key **`travelsync:auth-user`**
3. All API routes receive the user ID via:
   - **GET routes:** `?userId=X` query param
   - **POST/PATCH/DELETE routes:** `userId` field in the **JSON request body**
4. There is no token to validate — routes trust the userId from the request (internal app, not public API)

### TravelSync trip date problem

`plan_details.dates` is free text ("Aug 12–14"), so `groupPhotosByDay` cannot use it. The migration adds `start_date DATE` and `end_date DATE` columns (nullable) to the existing trips table. If null, the Memories tab falls back to a flat grid with no day grouping.

### TravelSync app architecture

TravelSync is a **single-page application**. There is no `app/trips/[id]/page.tsx`. The entire app renders through `components/Project3.tsx` (the `HarmonyApp` component) which manages a `screen` state and conditionally renders one of four screens:
- `'setup'` → `CreatorSetup`
- `'sandbox'` → `IdeaSandbox`
- `'draft'` → `AIDraft`
- `'success'` → `SuccessState` ← **this is the trip detail view**

The **Memories tab must be added to `components/screens/SuccessState.tsx`**. There is no page-router equivalent.

### TravelSync UI design tokens (Tailwind v4)

TravelSync uses a **light cream/parchment palette** — do NOT use dark mode classes (`bg-neutral-900`, `text-white/40`, etc.).

| Token | Value | Use |
|-------|-------|-----|
| `cream` | `#F7F5F0` | Page background |
| `cream-deep` | `#EDEAEA` | Borders, dividers |
| `parchment` | `#FAF8F4` | Card/input backgrounds |
| `sage` | `#7A9E8E` | Primary accent |
| `sand` | `#C4A882` | Secondary accent |
| `terra` | `#B8714E` | Alert / destructive |
| `ink` | `#2C2B28` | Primary text |
| `ink-mid` | `#5C5A56` | Secondary text |
| `ink-faint` | `#9B9892` | Placeholder text |

Typography: `font-display` (DM Serif Display) for headings, `font-sans` (Outfit) for body text.

Utility classes already defined in `app/globals.css`: `.input-field`, `.textarea-field`, `.select-field`, `.btn-primary`.

Animations available: `animate-fade-up`, `animate-pop-in`.

### Existing API route conventions

All API routes in TravelSync include:
```typescript
export const dynamic = 'force-dynamic';
```

Next.js 15/16 makes route params async — always destructure with `await`:
```typescript
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  // ...
}
```

The existing dynamic segment name used throughout TravelSync is **`[tripId]`** (not `[id]`).

---

## File Structure

### 🏠 Landing Page repo
| File | Action | Purpose |
|------|--------|---------|
| `src/lib/server/migrations/001_photo_albums_photos.sql` | Create | SQL migration: add date columns to trips, create photo_albums and photos tables |
| `src/scripts/migrate.ts` | Create | One-shot migration runner |

### ✈️ TravelSync repo
| File | Action | Purpose |
|------|--------|---------|
| `lib/db.ts` | **Already exists** — exports `dbQuery<T>` | No changes needed |
| `lib/tripPhotos.ts` | Create | DB queries: getTripLinkedAlbum, getTripPhotos |
| `lib/groupPhotos.ts` | Create | Pure fn: group photos array into day buckets |
| `components/memories/PhotoTimeline.tsx` | Create | Day-separated photo grid |
| `components/memories/MemoriesTab.tsx` | Create | Fetches photos, renders timeline or empty state |
| `app/api/trips/[tripId]/photos/route.ts` | Create | GET endpoint — returns photos for a trip |
| `components/screens/SuccessState.tsx` | Modify | Add Itinerary / Memories tab toggle + render MemoriesTab |

### 📷 PhotoSync repo
| File | Action | Purpose |
|------|--------|---------|
| `lib/db.ts` | Create | Shared pg pool (same pattern as TravelSync) |
| `lib/albums.ts` | Create | DB queries: getTripsForUser, createAlbum |
| `lib/extractTakenAt.ts` | Create | Pure fn: parse EXIF DateTimeOriginal from a Buffer |
| `lib/photos.ts` | Create | DB query: insertPhoto |
| `components/albums/NewAlbumModal.tsx` | Create | Create album UI with optional trip-link toggle |
| `app/api/albums/route.ts` | Create | POST /api/albums — creates album row |
| `app/api/photos/route.ts` | Create | POST /api/photos — uploads photo + saves row with taken_at |
| `app/api/trips/route.ts` | Create | GET /api/trips — returns TravelSync trips for the user (powers dropdown) |

---

## Part A — Database Migrations (🏠 Landing Page repo)

### Task 1: Write and run the migration SQL

> The `"TravelSync".trips` table **already exists**. This migration extends it with date columns and creates the two new tables.

**Files:**
- Create: `src/lib/server/migrations/001_photo_albums_photos.sql`
- Create: `src/scripts/migrate.ts`

- [ ] **Step 1: Create the SQL migration file**

```sql
-- src/lib/server/migrations/001_photo_albums_photos.sql
--
-- "TravelSync".trips already exists (BIGSERIAL id, owner_id BIGINT).
-- We extend it with nullable date columns so the photo timeline can group by day.
-- photo_albums and photos are new tables in the same schema.

ALTER TABLE "TravelSync".trips
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS end_date   DATE;

CREATE TABLE IF NOT EXISTS "TravelSync".photo_albums (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  BIGINT      NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  trip_id     BIGINT      REFERENCES "TravelSync".trips(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "TravelSync".photos (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id    UUID        NOT NULL REFERENCES "TravelSync".photo_albums(id) ON DELETE CASCADE,
  account_id  BIGINT      NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  storage_url TEXT        NOT NULL,
  taken_at    TIMESTAMPTZ,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_photo_albums_trip       ON "TravelSync".photo_albums(trip_id);
CREATE INDEX IF NOT EXISTS idx_photo_albums_account    ON "TravelSync".photo_albums(account_id);
CREATE INDEX IF NOT EXISTS idx_photos_album_id         ON "TravelSync".photos(album_id);
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
    join(__dirname, "../lib/server/migrations/001_photo_albums_photos.sql"),
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

- [ ] **Step 4: Verify in Neon console**

Log into https://console.neon.tech, open your database, confirm:
- `"TravelSync".trips` now has `start_date` and `end_date` columns
- `"TravelSync".photo_albums` and `"TravelSync".photos` tables exist

- [ ] **Step 5: Commit**

```bash
git add src/lib/server/migrations/001_photo_albums_photos.sql src/scripts/migrate.ts
git commit -m "feat: add photo_albums, photos tables and date columns to trips"
```

---

## Part B — TravelSync (✈️ TravelSync repo)

> **Reminder:** No `src/` prefix. Files live at `lib/`, `app/`, `components/` directly under the project root. Auth is userId-based (not token-based). The dynamic param name throughout this codebase is `tripId` (not `id`).

### Task 2: Trip photo queries

> `lib/db.ts` **already exists** and exports `dbQuery<T>`. Do not create or modify it.

**Files:**
- Create: `lib/tripPhotos.ts`

- [ ] **Step 1: Write the queries**

```typescript
// lib/tripPhotos.ts
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
    `SELECT id, name FROM "TravelSync".photo_albums
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
     FROM "TravelSync".photos p
     JOIN "TravelSync".photo_albums a ON p.album_id = a.id
     WHERE a.trip_id = $1 AND p.account_id = $2
     ORDER BY COALESCE(p.taken_at, p.uploaded_at) ASC`,
    [tripId, accountId]
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/tripPhotos.ts
git commit -m "feat: add trip photo queries"
```

---

### Task 3: groupPhotosByDay pure function + tests

**Files:**
- Create: `lib/groupPhotos.ts`
- Create: `lib/groupPhotos.test.ts`

> `vitest` is **already installed** in TravelSync's devDependencies. No install needed.

- [ ] **Step 1: Write the failing test**

```typescript
// lib/groupPhotos.test.ts
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

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm test
```

Expected: FAIL — `groupPhotosByDay` not found.

- [ ] **Step 3: Implement groupPhotosByDay**

```typescript
// lib/groupPhotos.ts
import type { TripPhoto } from "./tripPhotos";

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

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test
```

Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/groupPhotos.ts lib/groupPhotos.test.ts
git commit -m "feat: add groupPhotosByDay with tests"
```

---

### Task 4: GET /api/trips/[tripId]/photos route

**Files:**
- Create: `app/api/trips/[tripId]/photos/route.ts`

> This route sits alongside the existing `app/api/trips/[tripId]/route.ts` (DELETE) and `app/api/trips/[tripId]/shares/route.ts`. All use `[tripId]` as the dynamic segment.
>
> Auth pattern: userId comes from the `?userId=X` query param (no cookies, no tokens — matches all other GET routes in this codebase).

- [ ] **Step 1: Create the API route**

```typescript
// app/api/trips/[tripId]/photos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getTripPhotos, getTripLinkedAlbum } from "@/lib/tripPhotos";

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

  const [album, photos] = await Promise.all([
    getTripLinkedAlbum(tripId, userId),
    getTripPhotos(tripId, userId),
  ]);

  return NextResponse.json({ album, photos });
}
```

- [ ] **Step 2: Test the endpoint manually**

With the dev server running, get your userId from localStorage (`travelsync:auth-user` → `.id`):

```
GET http://localhost:3000/api/trips/123/photos?userId=1
```

Expected: `{ "album": null, "photos": [] }` (empty since no data yet — confirms the route works without crashing)

- [ ] **Step 3: Commit**

```bash
git add app/api/trips/[tripId]/photos/route.ts
git commit -m "feat: add GET /api/trips/[tripId]/photos route"
```

---

### Task 5: PhotoTimeline component

**Files:**
- Create: `components/memories/PhotoTimeline.tsx`

> Use TravelSync's **light cream palette** (ink, ink-mid, ink-faint, cream-deep, sage). No dark mode.

- [ ] **Step 1: Create the component**

```tsx
// components/memories/PhotoTimeline.tsx
"use client";

import Image from "next/image";
import { groupPhotosByDay } from "@/lib/groupPhotos";
import type { TripPhoto } from "@/lib/tripPhotos";

interface Props {
  photos: TripPhoto[];
  tripStartDate: string | null;
}

export function PhotoTimeline({ photos, tripStartDate }: Props) {
  if (!tripStartDate) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo) => (
          <PhotoThumb key={photo.id} photo={photo} />
        ))}
      </div>
    );
  }

  const allHaveDates = photos.every((p) => p.taken_at !== null);
  const groups = allHaveDates
    ? groupPhotosByDay(photos, tripStartDate)
    : [{ date: "", label: "", photos }];

  if (!allHaveDates) {
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
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-faint mb-3 font-sans">
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
    <div className="relative aspect-square overflow-hidden rounded-[10px] bg-cream-deep">
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
git add components/memories/PhotoTimeline.tsx
git commit -m "feat: add PhotoTimeline component"
```

---

### Task 6: MemoriesTab component

**Files:**
- Create: `components/memories/MemoriesTab.tsx`

> Auth: read `travelsync:auth-user` from localStorage to get the userId — consistent with how the rest of the app reads auth state.

- [ ] **Step 1: Create the component**

```tsx
// components/memories/MemoriesTab.tsx
"use client";

import { useEffect, useState } from "react";
import { PhotoTimeline } from "./PhotoTimeline";
import type { TripPhoto, LinkedAlbum } from "@/lib/tripPhotos";

interface Props {
  tripId: string;
  tripStartDate: string | null; // "YYYY-MM-DD" or null if not set on this trip
}

function getStoredUserId(): string | null {
  try {
    const raw = localStorage.getItem("travelsync:auth-user");
    if (!raw) return null;
    return JSON.parse(raw).id ?? null;
  } catch {
    return null;
  }
}

export function MemoriesTab({ tripId, tripStartDate }: Props) {
  const [photos, setPhotos]   = useState<TripPhoto[]>([]);
  const [album, setAlbum]     = useState<LinkedAlbum | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getStoredUserId();
    if (!userId) { setLoading(false); return; }
    fetch(`/api/trips/${tripId}/photos?userId=${userId}`)
      .then((r) => r.json())
      .then(({ photos, album }) => {
        setPhotos(photos ?? []);
        setAlbum(album ?? null);
      })
      .finally(() => setLoading(false));
  }, [tripId]);

  if (loading) {
    return (
      <p className="text-sm text-ink-faint py-8 text-center font-sans animate-pulse">
        Loading memories…
      </p>
    );
  }

  if (!album) {
    return (
      <div className="py-12 text-center">
        <p className="text-ink-mid text-sm font-sans">No photo album linked to this trip.</p>
        <p className="text-ink-faint text-xs mt-1 font-sans">
          Open PhotoSync, create an album, and link it to this trip.
        </p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-ink-mid text-sm font-sans">"{album.name}" is linked but has no photos yet.</p>
        <p className="text-ink-faint text-xs mt-1 font-sans">Upload photos in PhotoSync to see them here.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-ink-faint mb-4 font-sans">{album.name} · {photos.length} photos</p>
      <PhotoTimeline photos={photos} tripStartDate={tripStartDate} />
    </div>
  );
}
```

- [ ] **Step 2: Wire MemoriesTab into SuccessState**

Open `components/screens/SuccessState.tsx`. The trip detail view currently shows day tabs + activities. Add an **Itinerary / Memories** toggle above the existing content.

The trip data passed into SuccessState comes from the `HarmonyApp` state in `components/Project3.tsx`. You'll need to pass `savedTripId` (the DB id) and `trip.start_date` (new nullable column) down.

In `SuccessState`, add a local state for the active tab and conditionally render:

```tsx
// At the top of SuccessState, import:
import { MemoriesTab } from "@/components/memories/MemoriesTab";

// Add to SuccessState props:
// tripDbId: string       ← the numeric trip id from the DB (savedTripId in Project3.tsx)
// tripStartDate: string | null  ← trip.start_date from DB (null for trips created before migration)

// Inside the component, add state:
const [activeView, setActiveView] = useState<'itinerary' | 'memories'>('itinerary');

// Add the toggle just before the day tab bar / activity list:
<div className="flex gap-1 p-1 bg-cream-deep rounded-[10px] mb-4 w-fit">
  <button
    onClick={() => setActiveView('itinerary')}
    className={`px-4 py-1.5 rounded-lg text-sm font-sans transition-colors ${
      activeView === 'itinerary'
        ? 'bg-parchment text-ink shadow-soft'
        : 'text-ink-mid hover:text-ink'
    }`}
  >
    Itinerary
  </button>
  <button
    onClick={() => setActiveView('memories')}
    className={`px-4 py-1.5 rounded-lg text-sm font-sans transition-colors ${
      activeView === 'memories'
        ? 'bg-parchment text-ink shadow-soft'
        : 'text-ink-mid hover:text-ink'
    }`}
  >
    Memories
  </button>
</div>

{activeView === 'itinerary' && (
  // existing itinerary content (day tabs + activities)
)}

{activeView === 'memories' && (
  <MemoriesTab tripId={tripDbId} tripStartDate={tripStartDate} />
)}
```

- [ ] **Step 3: Pass tripDbId and tripStartDate from Project3.tsx to SuccessState**

In `components/Project3.tsx`, `savedTripId` holds the DB id of the saved trip. After saving a trip, also fetch or store `start_date` from the DB response if it exists. Pass both as props to `<SuccessState>`.

> If trips created before this migration have no `start_date`, `tripStartDate` will be `null` — the `MemoriesTab` and `PhotoTimeline` handle this gracefully with a flat grid fallback.

- [ ] **Step 4: Start dev server and verify**

```bash
npm run dev
```

Generate or load a saved trip. On the success screen you should see an "Itinerary / Memories" toggle. Click Memories — it should show the "No photo album linked" empty state. No console errors.

- [ ] **Step 5: Commit**

```bash
git add components/memories/PhotoTimeline.tsx components/memories/MemoriesTab.tsx components/screens/SuccessState.tsx components/Project3.tsx
git commit -m "feat: add Memories tab to trip detail view"
```

---

## Part C — PhotoSync (📷 PhotoSync repo)

> **TravelSync context for the PhotoSync implementor:**
>
> - The shared database uses a Postgres schema named **`"TravelSync"`** (case-sensitive, always double-quoted).
> - TravelSync trip IDs are **`BIGINT`** (returned as strings by `pg`). Store and pass them as strings.
> - User account IDs are **`BIGINT`** from `public.accounts` — same table used by TravelSync.
> - The user identity key in the browser is **`travelsync:auth-user`** in localStorage → `{ id, username, displayName }`. PhotoSync should use the same `public.accounts` table for auth (same Neon DB, same `DATABASE_URL`), so the `id` value is directly usable as `account_id` in photo_albums and photos.
> - To list a user's TravelSync trips: query `"TravelSync".trips WHERE owner_id = $1` (not a `trips` table in the public schema — that doesn't exist).
> - `"TravelSync".trips` has no `title` or `destination` columns. The name is in `plan_details->>'name'` and location in `plan_details->>'location'` (JSONB extraction). `start_date` and `end_date` are nullable DATE columns added by this migration.
> - PhotoSync's own new tables (`"TravelSync".photo_albums`, `"TravelSync".photos`) live in the same schema and were created by the Part A migration.

### Task 7: DB client + album queries

**Files:**
- Create: `lib/db.ts`
- Create: `lib/albums.ts`

- [ ] **Step 1: Create db.ts**

```typescript
// lib/db.ts
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
// lib/albums.ts
import { dbQuery } from "./db";

export interface Trip {
  id: string;           // BIGINT returned as string by pg
  title: string;        // from plan_details->>'name'
  destination: string;  // from plan_details->>'location'
  start_date: string | null;
  end_date: string | null;
}

export interface Album {
  id: string;
  name: string;
  trip_id: string | null;  // BIGINT as string, or null
}

export async function getTripsForUser(accountId: string): Promise<Trip[]> {
  return dbQuery<Trip>(
    `SELECT
       id,
       plan_details->>'name'     AS title,
       plan_details->>'location' AS destination,
       start_date,
       end_date
     FROM "TravelSync".trips
     WHERE owner_id = $1
     ORDER BY created_at DESC`,
    [accountId]
  );
}

export async function createAlbum(
  accountId: string,
  name: string,
  tripId: string | null
): Promise<Album> {
  const rows = await dbQuery<Album>(
    `INSERT INTO "TravelSync".photo_albums (account_id, name, trip_id)
     VALUES ($1, $2, $3)
     RETURNING id, name, trip_id`,
    [accountId, name, tripId ?? null]
  );
  return rows[0];
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/db.ts lib/albums.ts
git commit -m "feat: add db client and album queries"
```

---

### Task 8: EXIF extraction + tests

**Files:**
- Create: `lib/extractTakenAt.ts`
- Create: `lib/extractTakenAt.test.ts`

- [ ] **Step 1: Install exifr**

```bash
npm install exifr
```

- [ ] **Step 2: Write the failing test**

```typescript
// lib/extractTakenAt.test.ts
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
// lib/extractTakenAt.ts
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
git add lib/extractTakenAt.ts lib/extractTakenAt.test.ts
git commit -m "feat: add EXIF date extraction with tests"
```

---

### Task 9: Photo insert query

**Files:**
- Create: `lib/photos.ts`

- [ ] **Step 1: Create the query**

```typescript
// lib/photos.ts
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
    `INSERT INTO "TravelSync".photos (album_id, account_id, storage_url, taken_at)
     VALUES ($1, $2, $3, $4)
     RETURNING id, storage_url, taken_at`,
    [albumId, accountId, storageUrl, takenAt ?? null]
  );
  return rows[0];
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/photos.ts
git commit -m "feat: add photo insert query"
```

---

### Task 10: POST /api/albums route

**Files:**
- Create: `app/api/albums/route.ts`

> Auth: PhotoSync uses the same `public.accounts` table. Read the stored user object from localStorage (PhotoSync's auth key — check your auth implementation) and pass `userId` in the request body, matching the TravelSync pattern.

- [ ] **Step 1: Create the route**

```typescript
// app/api/albums/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAlbum } from "@/lib/albums";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { userId, name, tripId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });
  if (!name?.trim()) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const album = await createAlbum(String(userId), name.trim(), tripId ? String(tripId) : null);
  return NextResponse.json({ ok: true, album }, { status: 201 });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/albums/route.ts
git commit -m "feat: add POST /api/albums route"
```

---

### Task 11: POST /api/photos route

**Files:**
- Create: `app/api/photos/route.ts`

> `multipart/form-data` with `file`, `albumId`, and `userId` fields. Storage uses `public/uploads/` for dev — adapt to your production storage.

- [ ] **Step 1: Create the uploads directory**

```bash
mkdir -p public/uploads
echo "public/uploads/" >> .gitignore
```

- [ ] **Step 2: Create the route**

```typescript
// app/api/photos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { extractTakenAt } from "@/lib/extractTakenAt";
import { insertPhoto } from "@/lib/photos";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file    = form.get("file")    as File | null;
  const albumId = form.get("albumId") as string | null;
  const userId  = form.get("userId")  as string | null;

  if (!file || !albumId || !userId) {
    return NextResponse.json({ error: "file, albumId, and userId are required" }, { status: 400 });
  }

  const bytes  = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const takenAt = await extractTakenAt(buffer);

  const filename   = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const uploadDir  = join(process.cwd(), "public", "uploads");
  await writeFile(join(uploadDir, filename), buffer);
  const storageUrl = `/uploads/${filename}`;

  const photo = await insertPhoto(albumId, userId, storageUrl, takenAt);
  return NextResponse.json({ ok: true, photo }, { status: 201 });
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/photos/route.ts
git commit -m "feat: add POST /api/photos route with EXIF extraction"
```

---

### Task 12: GET /api/trips route (for the album-creation dropdown)

**Files:**
- Create: `app/api/trips/route.ts`

> This endpoint lets the NewAlbumModal populate the trip dropdown. It queries `"TravelSync".trips` directly.

- [ ] **Step 1: Create the route**

```typescript
// app/api/trips/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getTripsForUser } from "@/lib/albums";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });
  const trips = await getTripsForUser(userId);
  return NextResponse.json({ trips });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/trips/route.ts
git commit -m "feat: add GET /api/trips route for trip dropdown"
```

---

### Task 13: NewAlbumModal with trip-link toggle

**Files:**
- Create: `components/albums/NewAlbumModal.tsx`

> Auth: call `getStoredUserId()` from localStorage — adapt the key to whatever PhotoSync uses for its auth storage. The value must be the numeric account ID from `public.accounts`.

- [ ] **Step 1: Create the component**

```tsx
// components/albums/NewAlbumModal.tsx
"use client";

import { useState, useEffect } from "react";
import type { Trip } from "@/lib/albums";

interface Props {
  onClose: () => void;
  onCreated: (albumId: string) => void;
}

function getStoredUserId(): string | null {
  try {
    // Adapt this key to match PhotoSync's own auth storage
    const raw = localStorage.getItem("photosync:auth-user")
             ?? localStorage.getItem("travelsync:auth-user");
    if (!raw) return null;
    return JSON.parse(raw).id ?? null;
  } catch { return null; }
}

export function NewAlbumModal({ onClose, onCreated }: Props) {
  const [name, setName]         = useState("");
  const [linkTrip, setLinkTrip] = useState(false);
  const [trips, setTrips]       = useState<Trip[]>([]);
  const [tripId, setTripId]     = useState<string>("");
  const [loading, setLoading]   = useState(false);
  const [userId]                = useState(() => getStoredUserId());

  useEffect(() => {
    if (!linkTrip || !userId) return;
    fetch(`/api/trips?userId=${userId}`)
      .then((r) => r.json())
      .then((data) => setTrips(data.trips ?? []));
  }, [linkTrip, userId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !userId) return;
    setLoading(true);

    const res = await fetch("/api/albums", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        name: name.trim(),
        tripId: linkTrip ? tripId || null : null,
      }),
    });

    const data = await res.json();
    setLoading(false);
    if (data.ok) onCreated(data.album.id);
  }

  return (
    // Style this modal to match PhotoSync's own design language.
    // The form fields, buttons, and layout should match existing modals in your app.
    // Below is a functional stub — replace classNames with your actual design system.
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-lg"
      >
        <h2 className="font-bold text-lg">New Album</h2>

        <input
          type="text"
          placeholder="Album name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2"
          required
        />

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={linkTrip}
            onChange={(e) => setLinkTrip(e.target.checked)}
          />
          <span className="text-sm">Link to a TravelSync trip</span>
        </label>

        {linkTrip && (
          <select
            value={tripId}
            onChange={(e) => setTripId(e.target.value)}
            className="border rounded-xl px-4 py-2 text-sm outline-none"
          >
            <option value="">— Select a trip —</option>
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} · {t.destination}
                {t.start_date ? ` (${t.start_date})` : ""}
              </option>
            ))}
          </select>
        )}

        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim() || !userId}
            className="px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Wire NewAlbumModal into your PhotoSync albums page**

Add a "New Album" button to your albums index page that renders `<NewAlbumModal>` on click. Pass `onClose` and `onCreated` callbacks.

- [ ] **Step 3: Start dev server and smoke test the full flow**

1. Open PhotoSync, click "New Album"
2. Enter a name, enable "Link to a TravelSync trip"
3. Confirm the dropdown populates with trips fetched from TravelSync's DB
4. Create the album — confirm it appears in your albums list
5. Open TravelSync, navigate to that trip's success screen → Memories tab
6. Confirm it shows the album name and "no photos yet" state

- [ ] **Step 4: Commit**

```bash
git add components/albums/NewAlbumModal.tsx
git commit -m "feat: add NewAlbumModal with TravelSync trip linking"
```

---

## End-to-End Smoke Test

Once all tasks are complete, run through this full flow:

1. **Create a trip in TravelSync** with structured dates (if `start_date` column is exposed in the UI) — otherwise leave start_date null and verify flat-grid fallback
2. **Open PhotoSync** → New Album → "Rome Photos" → Link to Trip → select the trip → Create
3. **Upload a photo** (camera JPEG with EXIF data) to the "Rome Photos" album
4. **Open TravelSync** → navigate to that trip → Memories tab
5. Confirm: photo appears, grouped under "Day N · Month D" if start_date is set, or flat grid if not
6. **Upload a screenshot** (no EXIF) to the same album
7. Confirm: photos all appear (flat grid since not all have EXIF dates)
