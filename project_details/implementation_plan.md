# Implementation Plan — "The Last Honest Ad"

> **Three independently deployable repos**: `backend/` (Express API), `extension/` (Chrome MV3), `web/` (Next.js platform).
> Source specs live in `project_details/`.

---

## Resolved Decisions (V2 Updates)

> [!NOTE]
> 1.  **Compare Mode:** Deprioritized for MVP. Primary focus will be the core "Honest Ad vs Receipt" flow.
> 2.  **Universal Extraction & Token Cost:** To save tokens while maintaining ~80-90% site compatibility, we will pre-process the DOM using `@mozilla/readability` to strip navbars, footers, and ads *before* sending to the LLM. We will route this initial extraction task to a fast, free Groq model (e.g., Llama-3) to drastically cut costs compared to sending full HTML to Gemini.
> 3.  **Performance & Premium UI:** Added Next.js ISR, Edge caching, Skeleton Loaders, dynamic OG image generation (`@vercel/og`), `next/font`, and "Honest Receipt Mode" to the plan.

---

## Phase 1 — Project Scaffolding & Configuration

> **Goal**: All three repos initialized, buildable, and runnable with zero features. Every dev dependency, config file, and env template in place.

---

### Task 1.1 — Backend repo scaffold

| Key | Detail |
|-----|--------|
| **What** | Initialize `backend/` with Node + Express + TypeScript + Prisma + Zod |
| **Spec** | `backend.md §1 Folder Structure` — replicate the exact tree |
| **Spec** | `techstack.md §Backend API` — dependency list |
| **Deps** | `express`, `typescript`, `prisma`, `@prisma/client`, `zod`, `cors`, `dotenv`, `@clerk/backend`, `ai`, `@ai-sdk/google`, `@ai-sdk/groq` |
| **V2 Performance** | Add `compression`, `helmet`, and `node-cache` (or redis) for robust API edge caching and security |
| **Files** | `package.json`, `tsconfig.json`, `.env.example`, `src/index.ts` (hello-world server), `src/app.ts` (express app + CORS + JSON), `src/config/env.ts` (Zod-validated env vars) |
| **Verify** | `npm run dev` starts on PORT 4000, `GET /health` returns `{ status: "ok" }` |

---

### Task 1.2 — Extension repo scaffold

| Key | Detail |
|-----|--------|
| **What** | Initialize `extension/` with Vite + CRXJS + React + TypeScript + Tailwind + Framer Motion + Zustand |
| **Spec** | `frontend.md §3 Extension folder structure` |
| **Spec** | `techstack.md §Extension` — Vite + CRXJS is the build tool |
| **Files** | `manifest.json` (MV3, with `content_scripts`, `action` popup, required permissions), `vite.config.ts` (CRXJS plugin), `tailwind.config.js` (with design tokens), `src/popup/Popup.tsx` (placeholder), `src/content-script.ts` (placeholder) |
| **Verify** | `npm run dev` hot-reloads extension in Chrome, popup opens with placeholder text |

---

### Task 1.3 — Web platform repo scaffold

| Key | Detail |
|-----|--------|
| **What** | Initialize `web/` with Next.js + TypeScript + Tailwind + Framer Motion + Zustand + Clerk |
| **Spec** | `frontend.md §3 Web Platform folder structure` |
| **Spec** | `techstack.md §Web Platform` |
| **V2 Performance** | Configure `next.config.mjs` for `next/image` optimization domains and default caching strategies |
| **Files** | Standard Next.js app-router scaffold, `tailwind.config.js` (identical design tokens to extension), `app/layout.tsx` (ClerkProvider), `app/page.tsx` (placeholder landing), `lib/api.ts` (fetch wrapper stub) |
| **Verify** | `npm run dev` shows placeholder landing page |

---

### Task 1.4 — Shared design tokens & Fonts

| Key | Detail |
|-----|--------|
| **What** | Both `extension/tailwind.config.js` and `web/tailwind.config.js` must have identical `theme.extend` blocks. Add V2 CSS variables. |
| **Spec** | `frontend.md §2 Design Tokens` — colors (`paper`, `ink`, `ad-coral`, `stamp-red`, `warning-amber`, `receipt-gray`). |
| **V2 Fonts** | Web platform must use `next/font/google` in `layout.tsx` for `Archivo Black`, `Inter`, and `IBM Plex Mono` to eliminate layout shift (FOIT/FOUT). |
| **V2 Aesthetics** | Add Tailwind extensions for noise textures (`bg-noise`) and premium drop shadows (`shadow-stamp`, `shadow-overlay`). |
| **Verify** | Visual audit: paper background renders `#F2ECDC`, all three fonts load perfectly without shifting content. |

---

## Phase 2 — Database & Prisma Schema

> **Goal**: Full database schema deployed to Neon, seed data for categories and emission factors with real cited sources.

---

### Task 2.1 — Prisma schema

| Key | Detail |
|-----|--------|
| **What** | Create `backend/prisma/schema.prisma` with all models and relations |
| **Spec** | `backend.md §3 Database Schema` — definitions for `Category`, `EmissionFactor`, `GeneratedAd`, `GalleryPost`, `User` |
| **Relations** | `Category 1—N EmissionFactor`, `Category 1—N GeneratedAd`, `GeneratedAd 1—1 GalleryPost`, `User 1—N GeneratedAd` (nullable) |
| **V2 Features** | Add `format` enum to `GeneratedAd` (card vs receipt). Add `total_footprint_saved` and `scans_count` aggregated fields to `User` for instant dashboard loading. |
| **Verify** | `npx prisma validate` passes, `npx prisma migrate dev` applies cleanly to Neon |

---

### Task 2.2 — Prisma client singleton

| Key | Detail |
|-----|--------|
| **What** | Create `backend/src/lib/prisma.ts` — single `PrismaClient` instance |
| **Verify** | Import works from any service file |

---

### Task 2.3 — Seed data (categories + emission factors)

| Key | Detail |
|-----|--------|
| **What** | Create `backend/prisma/seed.ts` with initial categories and emission factors backed by real cited sources |
| **Categories** | `fast-fashion`, `electronics`, `flights`, `fast-food`, `delivery`, `home-goods` |
| **Verify** | `npx prisma db seed` populates rows, `SELECT * FROM "Category"` returns all categories |

---

## Phase 3 — Backend API & Core Services

> **Goal**: All API routes functional and tested. AI services (extraction, generation) producing real output. Edge caching active.

---

### Task 3.1 — Lib setup (AI clients + Clerk)

| Key | Detail |
|-----|--------|
| **What** | Create `src/lib/ai.ts` (Gemini + Groq model exports) and `src/lib/clerk.ts` (Clerk backend client) |
| **Spec** | `techstack.md §AI Layer` — Gemini for quality (generation), Groq for speed (fast classification, extraction) |

---

### Task 3.2 — Middleware (auth + error handler)

| Key | Detail |
|-----|--------|
| **What** | Create `src/middleware/auth.ts` (`requireAuth`) and `src/middleware/errorHandler.ts` |
| **Auth model** | Lightweight handle-only posting — no full account system. Clerk provides session identity. |

---

### Task 3.3 — Extraction service + route (Universal Token-Optimized)

| Key | Detail |
|-----|--------|
| **What** | `src/services/extraction.service.ts` + `src/controllers/ads.controller.ts` (extract handler) |
| **V2 Upgrade**| Instead of relying entirely on meta-tags, the content script will pre-process the DOM using `@mozilla/readability` to strip navbars and ads. It sends this cleaned text to the backend. |
| **V2 Upgrade**| The backend routes this cleaned text to a fast, free Groq model (e.g. Llama-3) to extract `productName` and `category` using minimal tokens while achieving 80-90% site compatibility. |
| **Verify** | `POST /api/extract` with cleaned DOM text returns plausible product info rapidly. |

---

### Task 3.4 — Footprint service

| Key | Detail |
|-----|--------|
| **What** | `src/services/footprint.service.ts` — given `categoryId` + optional `material`, query `EmissionFactor` |
| **Verify** | Service returns valid footprint data with source citation. |

---

### Task 3.5 — Generation service + route

| Key | Detail |
|-----|--------|
| **What** | `src/services/generation.service.ts` + generation handler |
| **Spec** | `originalCopy` + footprint → Gemini → `honestCopy`, persisted as `GeneratedAd` |
| **Verify** | `POST /api/generate` returns a funny, non-preachy honest rewrite + stores in DB. |

---

### Task 3.6 — Gallery routes (High Performance Cache)

| Key | Detail |
|-----|--------|
| **What** | `POST /api/ads/:id/publish` (auth required), `GET /api/gallery` (public, paginated) |
| **V2 Performance** | Add strict `Cache-Control` headers (e.g., `s-maxage=60, stale-while-revalidate`) to `GET /api/gallery` so Vercel's Edge Network serves it without hitting the Postgres DB on every page load. |

---

### Task 3.7 — Leaderboard route (High Performance Cache)

| Key | Detail |
|-----|--------|
| **What** | `GET /api/leaderboard?category=&page=` returns `GeneratedAd[]` sorted by footprint |
| **V2 Performance** | Add `Cache-Control` headers here as well for instantaneous global delivery. |

---

### Task 3.8 — Categories + Users routes

| Key | Detail |
|-----|--------|
| **What** | `GET /api/categories`, `GET /api/users/me/history`, `PATCH /api/users/me` |
| **V2 Feature** | History route must return the aggregated `total_footprint_saved` for the Personal Tracker dashboard. |

---

## Phase 4 — Chrome Extension (Premium UI)

> **Goal**: A snappy, instantly-classifying extension with seamless animations and alternative visual modes.

---

### Task 4.1 — Manifest V3 + content script skeleton

| Key | Detail |
|-----|--------|
| **What** | Finalize `manifest.json`, create `src/content-script.ts` |
| **V2 Feature** | Content script injects `@mozilla/readability` to parse the document tree cleanly before triggering the API extraction, drastically cutting token payload size. |

---

### Task 4.2 — Popup UI (Smarter Classification)

| Key | Detail |
|-----|--------|
| **What** | Build `src/popup/Popup.tsx` with `CategorySelector`, `GenerateButton` |
| **V2 Upgrade** | Instead of waiting for manual input, the popup immediately hits the fast Groq extraction route on open. Auto-suggests the category with sub-second latency. |

---

### Task 4.3 — ComparisonCard & HonestReceipt components

| Key | Detail |
|-----|--------|
| **What** | Build the visual components shared between extension overlay and web platform |
| **Spec** | Ad half: display font. Honest half: monospace, stamp badge. |
| **V2 Feature** | Build **Honest Receipt Mode** component — a toggleable alternative visual layout that looks like a CVS receipt with line-item environmental costs. |

---

### Task 4.4 — Injected overlay (Shadow DOM)

| Key | Detail |
|-----|--------|
| **What** | Build `src/overlay/Overlay.tsx`, inject into page via Shadow DOM |
| **V2 Upgrade** | Add **Framer Motion Skeleton Loaders**. While waiting 2-4s for Gemini generation, a shimmering skeleton perfectly mirroring the ComparisonCard shape keeps the perceived performance high. |
| **Verify** | Overlay smoothly animates in, CSS is isolated, skeletons appear immediately. |

---

### Task 4.5 — Publish + Share actions

| Key | Detail |
|-----|--------|
| **What** | `PublishButton` (auth required), `ShareButton` (copies to clipboard) |
| **Verify** | Publish creates gallery post. |

---

## Phase 5 — Next.js Web Platform

> **Goal**: Full web platform with landing page, public gallery, leaderboard, and personal history — all using the same visual language as the extension.

---

### Task 5.1 — Layout, Navbar, Footer

| Key | Detail |
|-----|--------|
| **What** | Build `app/layout.tsx`, `Navbar.tsx`, `Footer.tsx` |

---

### Task 5.2 — Landing page (`/`)

| Key | Detail |
|-----|--------|
| **What** | Build `app/page.tsx` with `Hero`, `InstallCTA`, `GalleryPreviewStrip` |
| **V2 Performance** | Ensure `next/image` is used for all hero product shots with `priority` set for optimal LCP. |

---

### Task 5.3 — Gallery page (`/gallery` + `/gallery/[id]`)

| Key | Detail |
|-----|--------|
| **What** | Build `app/gallery/page.tsx` (grid + filter), `app/gallery/[id]/page.tsx` |
| **V2 Upgrade** | Implement infinite scrolling via `IntersectionObserver` + SWR for 60fps browsing. |
| **V2 UI** | Add micro-interactions (hover lift, shadow bloom) to GalleryCards. |

---

### Task 5.4 — Leaderboard page (`/leaderboard`)

| Key | Detail |
|-----|--------|
| **What** | Build `app/leaderboard/page.tsx` |
| **Animation** | Framer Motion rank-change animations. |

---

### Task 5.5 — Auth pages + Personal Footprint Tracker (`/me`)

| Key | Detail |
|-----|--------|
| **What** | Build `app/sign-in/[[...index]]/page.tsx`, `app/me/page.tsx` |
| **V2 Upgrade** | Expand the `/me` page into the **Personal Footprint Tracker** dashboard. Use the DB aggregations to show lifetime footprint revealed/saved playfully. |

---

### Task 5.6 — API client (`lib/api.ts`)

| Key | Detail |
|-----|--------|
| **What** | Build `web/lib/api.ts` — fetch wrapper that attaches Clerk JWT. |

---

### Task 5.7 — Dynamic Social Sharing (`/api/og`)

| Key | Detail |
|-----|--------|
| **What** | Build `web/app/api/og/route.tsx` |
| **V2 Feature** | Use `@vercel/og` to dynamically generate a 1200x630 image preview of the specific Honest Ad when its gallery URL is shared on Twitter/X or iMessage. |
| **Verify** | Sharing a URL displays the Ad vs Receipt view as the link thumbnail. |

---

## Phase 6 — Integration, Polish & Deployment

> **Goal**: End-to-end flows working, tone-tuned AI output, responsive design, accessibility, and deployed to production.

---

### Task 6.1 — End-to-end integration testing

| Key | Detail |
|-----|--------|
| **What** | Test the complete user flow |
| **Verify** | Full flow works on 3+ different product sites (fashion, electronics, food) with the `@mozilla/readability` extractor. |

---

### Task 6.2 — AI tone tuning

| Key | Detail |
|-----|--------|
| **What** | Iterate on Gemini prompt template for "funny, punchy, not preachy" |

---

### Task 6.3 — Export-as-image feature

| Key | Detail |
|-----|--------|
| **What** | Generate a shareable comparison card image directly from the extension overlay |

---

### Task 6.4 — Responsive design + accessibility

| Key | Detail |
|-----|--------|
| **What** | Ensure mobile-responsive layouts (~400px popup width) and Web Content Accessibility Guidelines. |

---

### Task 6.5 — Deployment

| Key | Detail |
|-----|--------|
| **What** | Deploy all three services |
| **Steps** | 1. Neon. 2. Render. 3. Vercel. 4. Chrome Web Store. |
| **Verify** | Cache hit rates are high on the Vercel edge network for `/api/gallery`. |

---

## Conventions to Follow Throughout

| Rule | Source |
|------|--------|
| Strict TypeScript, no `any` | `backend.md` / `frontend.md` |
| `async/await` everywhere, no raw promise chains | `backend.md` |
| Route → Controller → Service → Prisma pattern | `backend.md` |
| Controllers never touch Prisma directly | `backend.md` |
| Zod validation at controller boundary | `backend.md` |
| Zustand store per feature area | `frontend.md` |
| `display` font → Ad half only. `mono` → Honest half only. | `frontend.md` |
| Response shape: `{ success, data }` / `{ success, error }` | `backend.md` |
