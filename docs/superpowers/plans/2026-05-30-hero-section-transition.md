# Hero Section Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an 80px gradient overlay to the bottom of HeroSection so the wave canvas fades to black instead of cutting off abruptly at the ProductsSection boundary.

**Architecture:** Single `div` inserted as the last child of the hero `<section>`. Absolutely positioned, bottom-pinned, `z-[3]` (above wave canvas and vignette, below nothing — the bottom of the section is empty space). Static overlay, no animation.

**Tech Stack:** Next.js 15, Tailwind CSS, React

---

### Task 1: Add fade overlay to HeroSection

**Files:**
- Modify: `src/components/hero/HeroSection.tsx`

No automated tests apply — purely visual. Verification is done by running the dev server.

- [ ] **Step 1: Add the overlay div**

Open `src/components/hero/HeroSection.tsx`. Find the closing `</section>` tag (currently the last line of the JSX return, just before `</>`). Insert this div immediately before it:

```tsx
        {/* Bottom fade — blends wave canvas into ProductsSection black */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-[3]"
          style={{
            height: "80px",
            background: "linear-gradient(to bottom, transparent, #000000)",
          }}
          aria-hidden
        />
```

The full closing of the section should look like:

```tsx
        {/* Bottom fade — blends wave canvas into ProductsSection black */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-[3]"
          style={{
            height: "80px",
            background: "linear-gradient(to bottom, transparent, #000000)",
          }}
          aria-hidden
        />
      </section>
    </>
  );
}
```

- [ ] **Step 2: Run the linter**

```bash
npm run lint
```

Expected: `✔ No ESLint warnings or errors`

- [ ] **Step 3: Verify visually**

```bash
npm run dev
```

Open `http://localhost:3000`. Scroll slowly from the hero into the products section. The wave canvas should fade to black over ~80px rather than cutting off with a hard edge.

- [ ] **Step 4: Commit**

```bash
git add src/components/hero/HeroSection.tsx
git commit -m "feat: add bottom fade overlay to hero section for smooth transition"
```
