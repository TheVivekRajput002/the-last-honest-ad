# Backend — The Last Honest Ad

Context file for AI-assisted scaffolding. Stack: Node.js + Express + TypeScript + Prisma + PostgreSQL (Neon) + Clerk (auth) + Vercel AI SDK (Gemini + Groq).

---

## 1. Folder Structure

backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── index.ts                 # entrypoint, starts server
│   ├── app.ts                   # express app, global middleware, route mounting
│   ├── config/
│   │   └── env.ts                # validated env vars (zod)
│   ├── lib/
│   │   ├── prisma.ts              # PrismaClient singleton
│   │   ├── ai.ts                  # Gemini + Groq model exports (Vercel AI SDK)
│   │   └── clerk.ts               # Clerk backend client
│   ├── middleware/
│   │   ├── auth.ts                # requireAuth — verifies Clerk JWT, attaches req.userId
│   │   └── errorHandler.ts        # centralized error → JSON response
│   ├── routes/
│   │   ├── ads.routes.ts
│   │   ├── gallery.routes.ts
│   │   ├── leaderboard.routes.ts
│   │   ├── categories.routes.ts
│   │   └── users.routes.ts
│   ├── controllers/               # parse req → call service → send response
│   │   ├── ads.controller.ts
│   │   ├── gallery.controller.ts
│   │   ├── leaderboard.controller.ts
│   │   └── users.controller.ts
│   ├── services/                  # business logic, no req/res
│   │   ├── extraction.service.ts  # AI: page text → {productName, category}
│   │   ├── generation.service.ts  # AI: honest ad copy
│   │   ├── footprint.service.ts   # emission factor lookup
│   │   └── leaderboard.service.ts
│   └── types/
│       └── index.ts
├── .env
├── package.json
└── tsconfig.json


Pattern: route → controller → service → prisma. Controllers never touch Prisma directly.

---

## 2. Environment Variables

DATABASE_URL=                  # Neon Postgres connection string
CLERK_SECRET_KEY=
CLERK_PUBLISHABLE_KEY=         # used by frontend, listed here for reference
GOOGLE_GENERATIVE_AI_API_KEY=  # Gemini, via @ai-sdk/google
GROQ_API_KEY=                  # via @ai-sdk/groq
PORT=4000
CORS_ORIGIN=                   # web platform URL

---

## 3. Database Schema (Prisma)

model Category {
  id              String           @id @default(uuid())
  name            String           @unique
  emissionFactors EmissionFactor[]
  generatedAds    GeneratedAd[]
}

model EmissionFactor {
  id          String   @id @default(uuid())
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])
  material    String?  // optional refinement signal, e.g. "polyester"
  co2eKg      Float
  waterLiters Float
  wasteKg     Float
  source      String   // citation, required — credibility requirement from PRD
  createdAt   DateTime @default(now())
}

model GeneratedAd {
  id             String       @id @default(uuid())
  sourceUrl      String
  productName    String
  categoryId     String
  category       Category     @relation(fields: [categoryId], references: [id])
  originalCopy   String
  honestCopy     String
  co2eKg         Float        // footprint snapshot at generation time
  waterLiters    Float
  wasteKg        Float
  sourceCitation String
  isPublic       Boolean      @default(false)
  userId         String?
  user           User?        @relation(fields: [userId], references: [id])
  galleryPost    GalleryPost?
  createdAt      DateTime     @default(now())
}

model GalleryPost {
  id            String      @id @default(uuid())
  generatedAdId String      @unique
  generatedAd   GeneratedAd @relation(fields: [generatedAdId], references: [id])
  likes         Int         @default(0)
  shares        Int         @default(0)
  createdAt     DateTime    @default(now())
}

model User {
  id           String        @id @default(uuid())
  clerkId      String        @unique
  handle       String?       @unique
  generatedAds GeneratedAd[]
  createdAt    DateTime      @default(now())
}

Relations: `Category 1—N EmissionFactor`, `Category 1—N GeneratedAd`, `GeneratedAd 1—1 GalleryPost` (only exists once published), `User 1—N GeneratedAd` (nullable — anonymous generation allowed).

---

## 4. Auth Flow (Clerk + JWT)

1. Web platform handles sign-in/sign-up via Clerk; Clerk issues a session JWT client-side.
2. Frontend sends `Authorization: Bearer <clerkToken>` on requests that need identity.
3. `middleware/auth.ts` → `requireAuth`: verifies the token using Clerk's backend SDK, extracts `clerkId`.
4. On first authenticated request, upsert local `User` row by `clerkId` (lazy-create) → attach `req.userId` (local DB id, not Clerk id) to the request.
5. Most routes are public (extraction, generation, public gallery, leaderboard, categories). Only **publish, history, handle update** require `requireAuth`.

---

## 5. API Routes

|Method|Path|Auth|Body / Params|Returns|
|---|---|---|---|---|
|POST|`/api/extract`|none|`{ pageText, sourceUrl }`|`{ productName, category, confidence }`|
|POST|`/api/generate`|none|`{ productName, categoryId, originalCopy, sourceUrl }`|`GeneratedAd`|
|GET|`/api/ads/:id`|none|—|`GeneratedAd`|
|POST|`/api/ads/:id/publish`|required|—|`GalleryPost`|
|GET|`/api/gallery`|none|`?category=&page=`|`GalleryPost[]` (with nested ad)|
|GET|`/api/leaderboard`|none|`?category=&page=`|`GeneratedAd[]` sorted by `co2eKg desc`|
|GET|`/api/categories`|none|—|`Category[]` with `emissionFactors`|
|GET|`/api/users/me/history`|required|—|`GeneratedAd[]` for `req.userId`|
|PATCH|`/api/users/me`|required|`{ handle }`|`User`|

All routes mounted under `/api`. Standard REST, no GraphQL.

---

## 6. Core Logic

**Extraction** (`extraction.service.ts`) — raw page text → Gemini prompt → parsed JSON `{productName, category, confidence}`. Low confidence → frontend falls back to manual category dropdown (always available, never block on AI).

**Footprint lookup** (`footprint.service.ts`) — given `categoryId` (+ optional `material`) → query `EmissionFactor` rows → prefer material-specific match, else category default → return `{co2eKg, waterLiters, wasteKg, source}`.

**Honest ad generation** (`generation.service.ts`) — `originalCopy` + footprint data → Gemini, fixed prompt template (tone: punchy, funny, not preachy, 2–3 sentences) → returns `honestCopy` → persisted as new `GeneratedAd`.

**Fast-path classification (optional)** — where latency matters live (e.g. popup suggesting a category before full generation), use Groq for a quick guess. Full generation always uses Gemini. Model selection lives in `lib/ai.ts`, swappable in one line via Vercel AI SDK.

**Leaderboard** (`leaderboard.service.ts`) — query `GeneratedAd`, optional `categoryId` filter, `ORDER BY co2eKg DESC`, paginated. No separate ranking store — plain SQL via Prisma.

**Gallery publish** — set `isPublic = true` on the `GeneratedAd`, create matching `GalleryPost` (likes/shares start at 0).

---

## 7. Response Convention

// success
{ success: true, data: T }
// error
{ success: false, error: { message: string, code?: string } }

All controllers return this shape. Errors thrown in services bubble up via `next(err)` to `errorHandler.ts`, which maps to the error shape above.

---

## 8. Conventions

- Strict TypeScript, no `any`
- `async/await` everywhere, no raw promise chains
- Request validation with `zod` at the controller boundary, before calling services
- Prisma client is a singleton (`lib/prisma.ts`) — never instantiate `PrismaClient` elsewhere
- Services contain all business logic and are framework-agnostic (no `req`/`res`) — keeps them directly testable and reusable