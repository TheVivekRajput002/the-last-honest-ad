# Frontend — The Last Honest Ad

Context file for AI-assisted scaffolding. Covers both frontend surfaces: the **extension UI** (popup + injected overlay) and the **web platform** (Next.js — gallery/leaderboard/landing). Stack: TypeScript + React + Tailwind CSS + Framer Motion + Zustand. Text-only — no image generation/export, no file storage.

---

## 1. Design Concept

The product's whole point is a contrast: a glossy ad lying to you vs. a stamped, audited truth next to it. The visual system is built directly from that — not a generic light/dark theme.

- **Ad half** — reads like glossy catalog/infomercial copy: bold condensed headline type, warm paper background, coral CTA color.
- **Honest half** — reads like a receipt/inspection stamp: monospace type, dotted tear-line divider, a rotated rubber-stamp badge carrying the footprint numbers.

**Signature element:** the **Footprint Stamp** — a rotated, stamp-red badge (`8.2kg CO2 · 2,700L WATER`, monospace, slightly rotated like a rubber ink stamp) overlaid on the honest half of every comparison card. This one element should be instantly recognizable across the extension and the web platform.

---

## 2. Design Tokens

// tailwind.config.js — theme.extend
colors: {
  paper:        '#F2ECDC', // base background — aged receipt/catalog paper
  ink:          '#1C1B19', // primary text
  'ad-coral':   '#FF4F3F', // Ad-half CTA / accent — sale-tag red-coral
  'stamp-red':  '#B3261E', // Honest-half stamp ink — deeper, distinct from ad-coral
  'warning-amber': '#D98E04', // footprint numbers, warning-label tone
  'receipt-gray':  '#8A8578', // secondary text, dotted divider lines
},
fontFamily: {
  display: ['Archivo Black', 'sans-serif'], // Ad-half headlines — bold, condensed, punchy
  body:    ['Inter', 'sans-serif'],          // all UI/body text
  mono:    ['IBM Plex Mono', 'monospace'],   // Honest-half copy, stamp, footprint stats
},

Usage rule: `display` font only ever appears inside the Ad half of a comparison card. `mono` only ever appears inside the Honest half / stamp. Mixing them elsewhere breaks the metaphor.

---

## 3. Folder Structure

### Extension (`extension/`)

extension/
├── src/
│   ├── popup/
│   │   ├── Popup.tsx
│   │   ├── components/
│   │   │   ├── CategorySelector.tsx
│   │   │   ├── GenerateButton.tsx
│   │   │   └── LoadingState.tsx
│   │   └── store/popupStore.ts        # Zustand
│   ├── overlay/
│   │   ├── Overlay.tsx                # mounted into Shadow DOM
│   │   ├── components/
│   │   │   ├── ComparisonCard.tsx
│   │   │   ├── FootprintStamp.tsx
│   │   │   ├── PublishButton.tsx
│   │   │   └── ShareButton.tsx        # copies honest text / gallery link
│   │   └── store/overlayStore.ts
│   ├── content-script.ts              # page scan, injects Overlay
│   └── shared/                        # tokens, api client, types
├── manifest.json
└── vite.config.ts

### Web Platform (`web/`)

web/
├── app/
│   ├── page.tsx                       # landing
│   ├── gallery/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── leaderboard/page.tsx
│   ├── me/page.tsx                    # auth required
│   └── sign-in/[[...index]]/page.tsx  # Clerk catch-all
├── components/
│   ├── shared/                        # mirrors extension's shared visual language
│   │   ├── ComparisonCard.tsx
│   │   ├── FootprintStamp.tsx
│   │   ├── Button.tsx
│   │   └── CategoryTag.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── gallery/
│   │   ├── GalleryGrid.tsx
│   │   ├── GalleryCard.tsx
│   │   └── CategoryFilter.tsx
│   ├── leaderboard/
│   │   ├── LeaderboardTable.tsx
│   │   └── LeaderboardRow.tsx
│   ├── landing/
│   │   ├── Hero.tsx
│   │   ├── InstallCTA.tsx
│   │   └── GalleryPreviewStrip.tsx
│   └── me/
│       ├── HistoryList.tsx
│       └── HandleEditor.tsx
├── store/                              # Zustand — filters, pagination
└── lib/api.ts                          # fetch wrapper, attaches Clerk JWT

`ComparisonCard` and `FootprintStamp` are the only components that must stay visually identical between the two repos — duplicate the file rather than reinterpret it.

---

## 4. Web Platform — Pages

|Route|Purpose|Key Components|
|---|---|---|
|`/`|Landing — hero with a live example comparison card, install CTA, gallery preview strip|`Hero`, `ComparisonCard`, `InstallCTA`, `GalleryPreviewStrip`|
|`/gallery`|Public feed of generated honest ads, filterable|`GalleryGrid`, `GalleryCard`, `CategoryFilter`, `Pagination`|
|`/gallery/[id]`|Full comparison card for one ad, share action|`ComparisonCard`, `FootprintStamp`, `ShareButton`|
|`/leaderboard`|Worst Offenders ranking, filterable by category|`LeaderboardTable`, `LeaderboardRow`, `CategoryFilter`|
|`/me`|Personal footprint history (auth required)|`HistoryList`, `FootprintStamp`, `HandleEditor`|
|`/sign-in`, `/sign-up`|Clerk-hosted auth screens|Clerk `<SignIn />` / `<SignUp />`|

---

## 5. Extension — Surfaces

|Surface|Trigger|Purpose|Key Components|
|---|---|---|---|
|Popup|Click extension icon|Confirm/override category, trigger generation|`CategorySelector`, `GenerateButton`, `LoadingState`|
|Injected Overlay|After "Generate"|Show original vs. honest side by side, directly on the live page|`ComparisonCard`, `FootprintStamp`, `PublishButton`, `ShareButton`|

---

## 6. User Flow

**Extension (primary product flow):**

1. User is on a product/ad page → highlights ad text, or extension auto-grabs title + meta description
2. Click extension icon → Popup opens → category auto-suggested (AI), dropdown to override
3. Click **Generate** → Popup closes, Loading state briefly shows in its place
4. **Overlay injects onto the live page** next to the original ad → `ComparisonCard` renders: Ad half (original copy, glossy styling) | Honest half (rewritten copy, mono type, `FootprintStamp` with cited co2/water/waste)
5. User can **Publish** (adds to public gallery, requires sign-in — triggers Clerk modal if not signed in) or **Share** (copies honest text + gallery link to clipboard)

**Web platform (discovery flow):**

1. Landing page → sees a live example `ComparisonCard` in the hero, clicks install or browses gallery
2. `/gallery` → browses/filters published ads by category
3. `/leaderboard` → sees ranked Worst Offenders, can filter by category
4. Sign in (Clerk) → `/me` shows personal scan history as a list of past `ComparisonCard`s

---

## 7. Conventions

- Strict TypeScript, no `any`
- Zustand store per feature area, not one global store
- Framer Motion reserved for: overlay injection reveal, gallery card enter transitions, leaderboard rank-change — not used decoratively elsewhere
- Mobile-responsive down to popup-width (~400px) for the extension; standard responsive breakpoints for web
- Visible keyboard focus states on every interactive element; respect `prefers-reduced-motion`
- Copy voice: plain, active, never preachy on the UI chrome itself — the joke lives in the generated honest copy, not in button labels or error states