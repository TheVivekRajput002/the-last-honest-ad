# Tech Stack — "The Last Honest Ad"

Built from your existing skill set, with one deliberate addition (flagged below) and Vercel AI SDK + Gemini/Groq as the AI layer per your call. Three independently deployable repos.

## Extension (Chrome, Manifest V3)

|Choice|Role|
|---|---|
|TypeScript + React|Popup UI|
|Tailwind CSS|Styling for popup + injected overlay — same design system as the web platform|
|Framer Motion|The overlay's reveal animation — this is the "aha" moment, worth the polish|
|Zustand|Local state: selected category, generation status, overlay open/closed|
|Shadow DOM|Isolates the injected overlay from host-page CSS|
|**Vite + CRXJS** _(addition)_|MV3 build tooling with hot-reload — not in your list, but there's no real way around a bundler for extension dev|

## Backend API (separate repo)

|Choice|Role|
|---|---|
|Node.js + Express + TypeScript|REST API — ingestion, footprint estimation, gallery/leaderboard endpoints|
|Prisma|Type-safe ORM over the Postgres schema (categories, emission_factors, generated_ads, gallery_posts)|
|Vercel AI SDK (`@ai-sdk/google`, `@ai-sdk/groq`)|AI calls — see "AI Layer" below|
|Clerk + JWT|Auth — Clerk issues sessions on the web platform, backend verifies the JWT on incoming requests|
|REST APIs|Simple CRUD + ranked-list endpoints|

Leaderboard ranking is handled with a straightforward `ORDER BY footprint DESC` query via Prisma — no separate ranking store needed at this scale.

## Web Platform — gallery / leaderboard / landing (separate repo)

|Choice|Role|
|---|---|
|Next.js + TypeScript + React|Pages, routing for the gallery feed, leaderboard, and landing page|
|Tailwind CSS|Same design system as the extension|
|Framer Motion|Gallery card transitions, leaderboard rank-change animations|
|Zustand|Client state: filters, pagination|
|Clerk|Optional sign-in for posting to the gallery under a handle|

## Database

|Choice|Role|
|---|---|
|PostgreSQL via Neon|Relational schema — categories, emission_factors, generated_ads, gallery_posts all have real foreign-key relationships|
|Prisma|Schema/migrations layer on top|

## AI Layer — Vercel AI SDK
npm install ai @ai-sdk/google @ai-sdk/gro

|Model|Used for|Why|
|---|---|---|
|**Gemini** (`@ai-sdk/google`)|Honest-ad generation, universal page/category extraction from arbitrary DOM/page text|Long context + strong general reasoning for parsing messy, unpredictable page content|
|**Groq** (`@ai-sdk/groq`, e.g. Llama on Groq's LPU inference)|Fast-path classification suggestion, anywhere latency is felt live in the demo|Groq's inference is the fastest available right now — useful for the steps where "instant" matters most for the in-page overlay to feel snappy|

The AI SDK makes swapping which model handles which step a one-line change, so this split (Gemini for quality, Groq for speed) is easy to re-tune once you see real latency/quality tradeoffs.

## Hosting

|Layer|Host|
|---|---|
|Backend (Express)|Render|
|Web platform (Next.js)|Vercel|
|Database|Neon (managed)|