# Product Requirements Document: "The Last Honest Ad"

**Status:** Draft v2 **Type:** Full product build (no fixed time constraint — extension + backend + web platform) **Owner:** [Your name] **Last updated:** June 19, 2026

---

## 1. Summary

A Chrome browser extension that detects ad/product content on any webpage and generates a satirical "honest version" of the ad copy, revealing the real environmental cost (emissions, water, waste) — same persuasive marketing tone, brutal honesty. Backed by a real database, a footprint-estimation engine grounded in public emissions data, and a companion web platform (public gallery, leaderboard, and shareable content) so the project reads as a full product, not a single-feature demo script.

**Working title:** "The Last Honest Ad" (alt names to brainstorm: _Honest.ly_, _GreenWashed_, _The Real Tag_, _Footprint Ad Co._)

---

## 2. Problem & Goal

Advertising routinely omits the environmental cost of production, shipping, and disposal. Most people have no intuitive sense of what a $5 t-shirt or a budget flight actually costs in emissions or water — and static info (labels, reports) doesn't land emotionally or virally the way a parody ad does.

**Goal:** Make environmental cost instantly legible and shareable by reusing the language of advertising itself against it — funny, punchy, not preachy — and back it with a real product surface (extension + web platform + data) so it's credible and demonstrably more than a one-off script.

---

## 3. Target Users

- **Shoppers** browsing fast fashion, electronics, flights, or food sites who want an instant, funny gut-check before buying
- **Social sharers** who post the generated "honest ads" or comparison cards
- **Judges/audience** (for a live demo context) — needs to land instantly with no explanation
- **Future B2B angle:** ethical brands could eventually opt into a verified "Honesty Score" badge (see Stretch Features)

---

## 4. Core User Flow

1. User is on a product page (e.g., a Shein listing, a flight result, a fast food item, an electronics listing)
2. User highlights ad text, or the extension auto-grabs the page title, meta description, and a representative product image
3. User clicks the extension icon → a small popup opens showing:
    - Auto-detected (or AI-classified) category, with a dropdown to override if needed
    - A "Generate Honest Ad" button
4. User clicks generate → the popup closes and **an overlay panel is injected directly onto the live page**, positioned next to or over the original ad
5. The overlay shows the original ad copy side-by-side with the AI-generated "honest" rewrite, styled to visually resemble a real ad (same font/price-tag/card conventions) — the contrast is immediate and visible on the actual site the user is browsing
6. User can:
    - **Export as image** — generates a shareable comparison card (sized for Instagram Story / Twitter / general social use)
    - **Post to public gallery** — optionally publishes the generated ad to the platform's public feed
    - **View on leaderboard** — see how this product/brand ranks against others already scanned

This in-page overlay approach (rather than a popup-only or new-tab flow) was chosen deliberately: seeing the honest ad appear _directly on the real ad, on the real site_ is the moment that makes the point land instantly, without explanation — critical both for everyday use and for live demos.

---

## 5. System Architecture

### 5.1 Browser Extension (Chrome, Manifest V3)

- Content script: scans the page for ad-like/product elements (title, meta tags, structured data like `og:` tags or JSON-LD product schema where available, visible large images, selected text as fallback)
- Popup UI: category confirmation + generate button
- Injected overlay UI: renders the before/after comparison directly on the page (Shadow DOM to avoid CSS collisions with the host site)
- Communicates with backend via authenticated API calls

### 5.2 Backend (Node/Express or similar)

- REST API handling:
    - Product/ad ingestion (text, image, detected category, source URL)
    - Footprint estimation (calls the footprint engine, see 5.4)
    - AI generation requests (calls AI model with footprint + ad copy)
    - Gallery feed (read/write public posts)
    - Leaderboard aggregation (rank by footprint within category/brand)
    - Optional lightweight auth (for saving personal history / posting to gallery under a handle)

### 5.3 Database

- Persistent store (Postgres recommended) with tables roughly:
    - `categories` — id, name, default emission factors
    - `emission_factors` — category/material-level CO2e, water, waste figures, with **source citation field** for credibility
    - `generated_ads` — id, source_url, product_name, category, original_copy, honest_copy, footprint_snapshot, image_url, created_at, is_public
    - `users` (optional, lightweight) — id, handle, created_at
    - `gallery_posts` — generated_ad_id, likes, shares
- Enables: history, gallery, leaderboard, and analytics — none of which are possible with a stateless hackathon script

### 5.4 Footprint Estimation Engine

- Two-tier approach for credibility:
    1. **Category-level baseline table** — curated, with real cited sources (e.g., published LCA studies, government emissions factor databases, industry sustainability reports) rather than arbitrary numbers — judges and users can click "source" and see where a figure comes from
    2. **Refinement layer (stretch)** — adjusts the baseline using detected signals like material (e.g., "100% polyester" vs "organic cotton"), shipping origin if detectable, or price-as-proxy-for-quality, to make estimates feel less generic
- All estimates labeled clearly as **directional, not audited** — credibility comes from cited sourcing and consistent methodology, not false precision

### 5.5 AI Generation

- Prompt pattern (tunable):
    
    > "Here is real ad copy for [product]: '[original text]'. Its estimated environmental footprint: [X kg CO2, Y liters water, Z waste], sourced from [citation]. Rewrite this ad in the same persuasive marketing tone and format, but make it brutally honest about the environmental cost. Keep it punchy and funny, not preachy. 2–3 sentences max."
    
- Tone tuning is a first-class workstream — test against real ad copy across categories until "funny, not preachy" is consistently hit

### 5.6 Companion Web Platform

- Public **gallery**: a feed of generated honest ads (opt-in publish), browsable/searchable by category or brand — turns the project into a growing public dataset, not a one-off tool
- **Leaderboard**: "Worst Offenders" — ranks brands/products by footprint based on aggregated scans, with category filters (most-scanned, highest footprint, etc.)
- **Landing page**: explains the project, links to install the extension, shows live gallery highlights — gives the project a real public face for sharing/pitching

---

## 6. Feature Set

### 6.1 Core Features (must-have)

- Manual + AI-assisted category detection (dropdown override always available)
- In-page injected overlay showing original vs. honest ad
- Cited, category-based footprint estimation engine
- AI-generated honest ad copy, tone-tuned
- Export-as-image sharing
- Public gallery (opt-in publish)
- Worst Offenders leaderboard

### 6.2 Features That Add Real Impressiveness/Credibility

- **Source-cited footprint data** — every number links to where it came from (LCA study, govt database, etc.) — single biggest credibility lever for judges who'll ask "where did that number come from?"
- **Smarter, AI-based product classification** — instead of only relying on user-picked category, use the AI model itself to read page content and suggest the category automatically (user can still override) — removes a manual step and feels more "magic"
- **Universal page support via AI extraction** — rather than hardcoding scraping logic for 3–4 specific sites, use an LLM call to parse arbitrary page text/DOM and extract product name, price, and category — works on essentially any product page, not just pre-tested ones
- **"Honest Receipt" mode** — instead of just rewriting the ad, generate a mock receipt/checkout summary with hidden costs added as real line items ("Shipping: $4.99", "Actual cost to the planet: 8kg CO2, 2,700L water") — a second format that's very shareable and visually distinct from the ad rewrite
- **Personal footprint tracker** (for logged-in users) — running tally of estimated footprint across everything a user has scanned, framed lightly/humorously, not guilt-driven
- **Compare mode** — scan two products and show honest ads + footprints side-by-side (e.g., "fast fashion dress" vs. "secondhand equivalent")
- **One-click social posting** — directly post the exported card to Twitter/X or Instagram via share intent, rather than just downloading an image
- **Public API** — expose the honest-ad generation as a simple API other developers could call, widening the "this is a platform" story
- **Brand opt-in "Honesty Score" badge (B2B angle)** — a forward-looking pitch: brands could embed a verified badge showing their actual footprint, turning the tool from "gotcha" into a potential industry standard — strong for judges evaluating long-term viability, not just the joke

### 6.3 Explicitly Out of Scope (for now)

- Precise, individually audited carbon accounting per SKU
- Multi-language localization (future consideration)
- Native mobile app

---

## 7. Success Metrics

- **Demo/first-use clarity:** A new user or judge gets the point within seconds of seeing the overlay, no explanation needed
- **Coverage:** Extension produces a usable result on an arbitrary, previously-unseen product page (not just pre-tested ones), validating the AI-extraction approach
- **Credibility:** Every footprint figure shown has a visible, clickable source
- **Engagement loop:** Gallery and leaderboard show real, growing data after a handful of test sessions, demonstrating the platform angle works, not just the single-extension demo
- **Shareability:** Export/share flow produces a clean, recognizable image suitable for social posting without further editing

---

## 8. Risks & Mitigations

|Risk|Mitigation|
|---|---|
|AI output too preachy or too cute, joke doesn't land|Dedicated tone-tuning pass against real ad copy across all categories before considering it done|
|Footprint numbers challenged for accuracy|Cite sources for every figure; label clearly as directional estimates, not audited data|
|AI-based universal extraction misreads a page|Keep manual override (category dropdown, editable product name) always available as a fallback|
|Public gallery/leaderboard enables abuse (spam, bad-faith targeting of individuals)|Restrict gallery to brand/product-level entries, not personal data; add basic moderation/reporting|
|Backend/database adds real infrastructure to maintain|Worth it given the platform ambitions — budget proper setup (hosting, DB, auth) rather than treating it as throwaway|

---

## 9. Open Questions

- Final product name (brainstorm needed)
- Auth approach for the web platform — full accounts, or lightweight handle-only posting?
- Which emissions data sources to standardize on for citations (e.g., government LCA databases, published industry sustainability reports)
- Whether the "Honesty Score" B2B badge is a real roadmap item or a forward-looking pitch point only

---

## 10. Next Step

Scaffold the foundational pieces in parallel:

1. Extension skeleton (manifest, popup, content script, injected overlay UI)
2. Backend API + database schema (categories, emission_factors, generated_ads, gallery_posts)
3. Footprint engine v1 with cited baseline data for initial categories
4. AI prompt logic for honest-ad generation, with first tone-tuning pass