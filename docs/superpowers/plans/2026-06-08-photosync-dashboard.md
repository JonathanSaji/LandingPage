# PhotoSync Dashboard Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect PhotoSync photo data into the SubSync dashboard — a 3-thumbnail strip in the compact tile and a 20-photo flat grid in the expanded modal.

**Architecture:** One new `/api/photosync` route queries the existing `photos` + `photo_albums` tables and returns 20 photos. The dashboard fetches this on mount alongside all other app routes, stores results in state, and threads the data down as a prop to `BentoCard` (compact tile) and `ExpandedTile` (modal). Regular `<img>` tags are used for photo thumbnails — not `next/image` — because `storage_url` is an external URL and no remote domains are whitelisted in `next.config.ts`.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v4, Framer Motion 12, `pg` (Neon PostgreSQL via `@/lib/server/db`)

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `src/app/api/photosync/route.ts` | API route — fetches 20 most recent photos |
| Modify | `src/app/dashboard/page.tsx` | Interface, state, fetch, props, tile UI, modal UI, CTA |

---

## Task 1 — Create `/api/photosync` route

**Files:**
- Create: `src/app/api/photosync/route.ts`

- [ ] **Step 1: Create the file**

```typescript
// src/app/api/photosync/route.ts
import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/server/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdStr = searchParams.get("userId");

    if (!userIdStr) {
      return NextResponse.json(
        { ok: false, error: "userId query parameter is required." },
        { status: 400 },
      );
    }

    let userId = parseInt(userIdStr, 10);
    if (isNaN(userId)) {
      return NextResponse.json(
        { ok: false, error: "Invalid userId parameter." },
        { status: 400 },
      );
    }

    if (userId === 999) {
      const userRes = await dbQuery(
        "SELECT id FROM accounts WHERE username = 'user1' LIMIT 1",
      );
      if (userRes.rows.length > 0) {
        userId = parseInt(userRes.rows[0].id, 10);
      }
    }

    const result = await dbQuery<{
      id: string;
      storage_url: string;
      taken_at: string | null;
      uploaded_at: string;
      album_name: string;
    }>(
      `SELECT p.id::text, p.storage_url, p.taken_at, p.uploaded_at, pa.name AS album_name
       FROM photos p
       JOIN photo_albums pa ON p.album_id = pa.id
       WHERE p.account_id = $1
       ORDER BY COALESCE(p.taken_at, p.uploaded_at) DESC
       LIMIT 20`,
      [userId],
    );

    return NextResponse.json({ ok: true, photos: result.rows });
  } catch (error) {
    console.error("Failed to fetch PhotoSync photos:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error." },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Verify the route responds**

Start the dev server if not running:
```bash
npm run dev
```

In the browser or a terminal, hit:
```
http://localhost:3000/api/photosync?userId=1
```

Expected: `{ "ok": true, "photos": [...] }` (empty array is fine if no photos exist yet — confirms the route works without crashing).

Expected on missing param: `http://localhost:3000/api/photosync` → `{ "ok": false, "error": "userId query parameter is required." }`

- [ ] **Step 3: Commit**

```bash
git add src/app/api/photosync/route.ts
git commit -m "feat: add /api/photosync route — returns 20 most recent photos"
```

---

## Task 2 — Add interface, state, and fetch in the dashboard page

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Add the `PhotoSyncPhoto` interface**

Find the `SteadySyncSettings` interface in `src/app/dashboard/page.tsx` (around line 291). Add the new interface directly after it:

```typescript
// After the closing brace of SteadySyncSettings:
interface PhotoSyncPhoto {
  id: string;
  storage_url: string;
  taken_at: string | null;
  uploaded_at: string;
  album_name: string;
}
```

- [ ] **Step 2: Add `photoSyncPhotos` state**

Find this block of state declarations (around line 1880):
```typescript
  const [fluencySessions, setFluencySessions] = useState<FluencySession[]>([]);
  const [steadySettings, setSteadySettings] = useState<SteadySyncSettings | null>(null);
```

Add one line after `steadySettings`:
```typescript
  const [photoSyncPhotos, setPhotoSyncPhotos] = useState<PhotoSyncPhoto[]>([]);
```

- [ ] **Step 3: Add the fetch to `fetchDashboardData`**

Find the `Promise.all` array inside `fetchDashboardData` (around line 2111):
```typescript
      Promise.all([
        fetch(`/api/subscriptions?userId=${accountId}`).then((res) => res.json()),
        fetch(`/api/trips?userId=${accountId}`).then((res) => res.json()),
        fetch(`/api/brainsync?userId=${accountId}`).then((res) => res.json()),
        fetch(`/api/fluencysync?userId=${accountId}`).then((res) => res.json()),
        fetch(`/api/steadysync?userId=${accountId}`).then((res) => res.json()),
      ])
        .then(([subsData, tripsData, brainData, fluencyData, steadyData]) => {
```

Replace with:
```typescript
      Promise.all([
        fetch(`/api/subscriptions?userId=${accountId}`).then((res) => res.json()),
        fetch(`/api/trips?userId=${accountId}`).then((res) => res.json()),
        fetch(`/api/brainsync?userId=${accountId}`).then((res) => res.json()),
        fetch(`/api/fluencysync?userId=${accountId}`).then((res) => res.json()),
        fetch(`/api/steadysync?userId=${accountId}`).then((res) => res.json()),
        fetch(`/api/photosync?userId=${accountId}`).then((res) => res.json()),
      ])
        .then(([subsData, tripsData, brainData, fluencyData, steadyData, photoData]) => {
```

- [ ] **Step 4: Handle the PhotoSync response**

Find the end of the `.then` handler, just before the `.catch` (around line 2138):
```typescript
          if (steadyData.ok && steadyData.settings) {
            setSteadySettings(steadyData.settings);
          } else {
            setSteadySettings(null);
          }
        })
        .catch((err) => console.error("Error fetching dashboard data:", err))
```

Add the PhotoSync handler inside the `.then` block, after the steadyData block:
```typescript
          if (steadyData.ok && steadyData.settings) {
            setSteadySettings(steadyData.settings);
          } else {
            setSteadySettings(null);
          }
          if (photoData.ok && Array.isArray(photoData.photos)) {
            setPhotoSyncPhotos(photoData.photos);
          }
        })
        .catch((err) => console.error("Error fetching dashboard data:", err))
```

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: add PhotoSyncPhoto interface, state, and fetch to dashboard"
```

---

## Task 3 — Thread `photoSyncPhotos` prop through `BentoCard` and `ExpandedTile`

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Add prop to `BentoCard` interface**

Find the `BentoCard` props interface (around line 330):
```typescript
  fluencySessions?: FluencySession[];
  steadySettings?: SteadySyncSettings | null;
  loading?: boolean;
```

Add `photoSyncPhotos` after `steadySettings`:
```typescript
  fluencySessions?: FluencySession[];
  steadySettings?: SteadySyncSettings | null;
  photoSyncPhotos?: PhotoSyncPhoto[];
  loading?: boolean;
```

- [ ] **Step 2: Add prop to `BentoCard` destructuring**

Find the destructured props in the `BentoCard` function signature (around line 350):
```typescript
  fluencySessions = [],
  steadySettings = null,
  loading = false,
```

Add `photoSyncPhotos` after `steadySettings`:
```typescript
  fluencySessions = [],
  steadySettings = null,
  photoSyncPhotos = [],
  loading = false,
```

- [ ] **Step 3: Add prop to `ExpandedTile` interface**

Find the `ExpandedTile` props interface (around line 1200):
```typescript
  fluencySessions?: FluencySession[];
  steadySettings?: SteadySyncSettings | null;
  loading?: boolean;
```

Add `photoSyncPhotos` after `steadySettings`:
```typescript
  fluencySessions?: FluencySession[];
  steadySettings?: SteadySyncSettings | null;
  photoSyncPhotos?: PhotoSyncPhoto[];
  loading?: boolean;
```

- [ ] **Step 4: Add prop to `ExpandedTile` destructuring**

Find the destructured params of the `ExpandedTile` function (around line 1209):
```typescript
  fluencySessions = [],
  steadySettings = null,
  loading = false,
```

Add `photoSyncPhotos` after `steadySettings`:
```typescript
  fluencySessions = [],
  steadySettings = null,
  photoSyncPhotos = [],
  loading = false,
```

- [ ] **Step 5: Pass prop to `BentoCard` in the grid**

Find the `BentoCard` usage inside the grid map (around line 2359):
```typescript
                  fluencySessions={fluencySessions}
                  steadySettings={steadySettings}
                  loading={loadingSubs}
```

Add `photoSyncPhotos` before `loading`:
```typescript
                  fluencySessions={fluencySessions}
                  steadySettings={steadySettings}
                  photoSyncPhotos={photoSyncPhotos}
                  loading={loadingSubs}
```

- [ ] **Step 6: Pass prop to `ExpandedTile`**

Find the `ExpandedTile` usage (around line 2460):
```typescript
              fluencySessions={fluencySessions}
              steadySettings={steadySettings}
              loading={loadingSubs}
```

Add `photoSyncPhotos` before `loading`:
```typescript
              fluencySessions={fluencySessions}
              steadySettings={steadySettings}
              photoSyncPhotos={photoSyncPhotos}
              loading={loadingSubs}
```

- [ ] **Step 7: Verify the app still loads**

Open `http://localhost:3000/dashboard` and confirm:
- Dashboard loads without TypeScript or runtime errors
- PhotoSync tile still shows "COMING SOON" (the new prop is threaded but no UI change yet)

- [ ] **Step 8: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: thread photoSyncPhotos prop through BentoCard and ExpandedTile"
```

---

## Task 4 — PhotoSync compact tile UI in `BentoCard`

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Add the PhotoSync compact branch**

Find the `SteadySync` branch end and the beginning of the final `else` block (around line 1117):
```typescript
          ) : (
            <>
              <div
                style={{
                  height: "1px",
                  background: `linear-gradient(90deg, ${tile.accent}15, rgba(255,255,255,0.04), transparent)`,
                  margin: isTall ? "20px 0" : "14px 0",
                }}
              />

              <div className="flex flex-1 flex-col items-center justify-center gap-3">
                <span
                  className="font-body font-semibold uppercase"
```

Replace the entire opening `(` of that else with a new PhotoSync branch inserted before it:
```typescript
          ) : tile.name === "PhotoSync" ? (
            <div className="mt-3 flex min-h-0 flex-1 flex-col justify-between">
              <p
                className="font-body font-bold uppercase"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.12em",
                  color: "rgba(255, 255, 255, 0.4)",
                  marginBottom: "6px",
                }}
              >
                Recent memories
              </p>

              {loading ? (
                <div className="flex flex-1 items-center justify-center py-4">
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      border: `2px solid ${tile.accent}26`,
                      borderTopColor: tile.accent,
                      animation: "sb-spin 0.8s linear infinite",
                    }}
                  />
                </div>
              ) : photoSyncPhotos.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.01] p-3">
                  <p className="font-body text-center text-[11px] text-white/40">No photos yet.</p>
                  <p className="font-body text-center text-[10px] text-white/20 mt-1">Ready to capture your first memory.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-1.5 min-h-0 flex-1">
                    {photoSyncPhotos.slice(0, 3).map((photo) => (
                      <div
                        key={photo.id}
                        className="relative overflow-hidden rounded-lg"
                        style={{
                          aspectRatio: "1",
                          border: `1px solid ${tile.accent}20`,
                          background: `${tile.accent}0D`,
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.storage_url}
                          alt={photo.album_name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="font-body text-[10px] text-white/40 mt-2 text-center truncate">
                    {photoSyncPhotos.length} recent photos · {photoSyncPhotos[0].album_name}
                  </p>
                </>
              )}

              <motion.div
                className="pointer-events-none absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1 font-body"
                style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px" }}
                animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 4 }}
                transition={{ duration: 0.25, ease: EASE }}
              >
                <span>Tap to preview</span>
                <ArrowUpRight size={10} />
              </motion.div>
            </div>
          ) : (
            <>
              <div
                style={{
                  height: "1px",
                  background: `linear-gradient(90deg, ${tile.accent}15, rgba(255,255,255,0.04), transparent)`,
                  margin: isTall ? "20px 0" : "14px 0",
                }}
              />

              <div className="flex flex-1 flex-col items-center justify-center gap-3">
                <span
                  className="font-body font-semibold uppercase"
```

- [ ] **Step 2: Verify the PhotoSync tile**

Open `http://localhost:3000/dashboard`. The PhotoSync tile should now show:
- If no photos: dashed empty state box with "No photos yet."
- If photos exist: a 3-column grid of thumbnails + caption below

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: add PhotoSync compact tile — 3-photo thumbnail strip"
```

---

## Task 5 — PhotoSync modal UI in `ExpandedTile` + CTA fix

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Add the PhotoSync modal branch**

Find the generic "COMING SOON" branch in `ExpandedTile` (around line 1833):
```typescript
          ) : (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed border-white/10 rounded-2xl bg-white/[0.01] mb-8">
              <span className="font-body text-xs text-white/40 font-semibold uppercase tracking-wider">
                COming soon
              </span>
            </div>
          )}
```

Replace it with a PhotoSync branch inserted before the final else:
```typescript
          ) : tile.name === "PhotoSync" ? (
            <div className="space-y-3 mb-8">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      border: `2px solid ${tile.accent}1F`,
                      borderTopColor: tile.accent,
                      animation: "sb-spin 0.8s linear infinite",
                    }}
                  />
                </div>
              ) : photoSyncPhotos.length === 0 ? (
                <div className="flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl p-6 bg-white/[0.01]">
                  <p className="font-body text-xs text-white/40 text-center">
                    No photos in PhotoSync yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {photoSyncPhotos.map((photo, i) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, ease: EASE }}
                      className="relative overflow-hidden rounded-xl"
                      style={{
                        aspectRatio: "1",
                        border: `1px solid ${tile.accent}20`,
                        background: `${tile.accent}0D`,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.storage_url}
                        alt={photo.album_name}
                        className="h-full w-full object-cover"
                      />
                      <div
                        className="absolute bottom-0 left-0 right-0 px-1.5 py-1"
                        style={{
                          background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                        }}
                      >
                        <p className="font-body text-[9px] text-white/60 truncate">{photo.album_name}</p>
                        <p className="font-body text-[8px] text-white/40 truncate">
                          {new Date(photo.taken_at ?? photo.uploaded_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed border-white/10 rounded-2xl bg-white/[0.01] mb-8">
              <span className="font-body text-xs text-white/40 font-semibold uppercase tracking-wider">
                COming soon
              </span>
            </div>
          )}
```

- [ ] **Step 2: Update the CTA banner condition**

Find the CTA condition at the bottom of `ExpandedTile` (around line 1859):
```typescript
              {tile.name === "TrackerSync" || tile.name === "TravelSync" || tile.name === "FluencySync" || tile.name === "SteadySync"
                ? "Ecosystem Live — Syncing Data"
                : "Launching Soon — Stay Tuned"}
```

Add `"PhotoSync"` to the live condition:
```typescript
              {tile.name === "TrackerSync" || tile.name === "TravelSync" || tile.name === "FluencySync" || tile.name === "SteadySync" || tile.name === "PhotoSync"
                ? "Ecosystem Live — Syncing Data"
                : "Launching Soon — Stay Tuned"}
```

- [ ] **Step 3: Verify the expanded modal**

Open `http://localhost:3000/dashboard`, click the PhotoSync tile. Confirm:
- Modal opens with the PhotoSync header (logo, "MEMORY" label, "PhotoSync" title)
- "Recent photos" section shows either the grid or the empty state
- Bottom CTA says "Ecosystem Live — Syncing Data"
- Escape key and backdrop click close the modal

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: add PhotoSync expanded modal — flat photo grid + CTA fix"
```

---

## Done

After all 5 tasks are committed, the PhotoSync tile is fully wired:
- Compact tile: 3-photo thumbnail strip, scales with card size, empty state, loading spinner
- Expanded modal: 20-photo flat grid with album name + date labels, empty state
- CTA banner correctly shows "Ecosystem Live — Syncing Data"
- No "COMING SOON" placeholder remains for PhotoSync
