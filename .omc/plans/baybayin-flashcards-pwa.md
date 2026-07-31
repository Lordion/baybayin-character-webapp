# Plan: Baybayin Flashcards Webapp + PWA

**Status:** approved — implementing

## Requirements Summary

A client-only React webapp presenting all 17 base Baybayin script characters as interactive flashcards:
- 3 vowels: A, E/I, O/U
- 14 consonants (inherent 'a' sound): BA, KA, DA/RA, GA, HA, LA, MA, NA, NGA, PA, SA, TA, WA, YA

Installable as a PWA (works offline), deployed to Vercel. No backend/server.

## Principles

1. Simplicity first — ship a working flashcard core before quiz/stats extras
2. Offline-first — full PWA behavior, not just an installable shell
3. Typographic accuracy — correct native Baybayin glyphs via self-hosted Noto Sans Tagalog, not approximations
4. Zero-backend — pure static client app, matches course-project scope
5. Mobile-first responsive design
6. React is chosen over a simpler vanilla-JS approach for course-project framework demonstration value, despite 17 static cards not strictly requiring a SPA framework — this tradeoff is accepted deliberately, not by default

## Decision Drivers

1. Trivial Vercel deployability (favors static build tooling)
2. Content/typographic correctness for the 17 glyphs
3. Time-to-ship for a course project (favor lean tooling over heavy frameworks)

## Options Considered

- **Chosen — Vite + React (TS) + `vite-plugin-pwa`**: minimal config, official PWA plugin, zero-config Vercel deploy.
- **Chosen — Tailwind CSS** for styling (replaces plain CSS/CSS Modules): utility-first classes give fast mobile-first responsive styling (`sm:`/`md:` breakpoints) without hand-writing media queries, and `@tailwindcss/vite` integrates directly into the existing Vite build with no extra config layer.
- **Rejected — Next.js + `next-pwa`**: SSR/serverless is overkill with no backend need; `next-pwa` has maintenance gaps.
- **Rejected — Create React App**: deprecated/unmaintained by the React team, not recommended for new projects.
- **Noted but not chosen — vanilla JS/HTML/CSS + hand-written service worker**: architect's steelman; more auditable, smaller failure surface, but forgoes the React/component-model demonstration value the course project is going for.

## Implementation Steps

1. Scaffold with Vite + React (TypeScript); install Tailwind CSS via `@tailwindcss/vite` plugin
2. Static dataset `src/data/characters.json`: glyph, romanization, notes per character (all 17)
3. `Flashcard` component: tap/click to flip, next/prev, progress indicator — styled with Tailwind utility classes. Card order: Fisher-Yates-shuffle the 17-character array once per pass, and maintain a numeric cursor (0–16) into it; `next()` increments the cursor and, when it exceeds 16, reshuffles and resets the cursor to 0, starting a new pass. `prev()` decrements the cursor; at cursor 0, `prev()` is a no-op/disabled (clamped) rather than wrapping into the previous pass. Note: a repeat is possible at the exact boundary between two consecutive passes (last card of pass N equals first card of pass N+1) — accepted as a simplicity tradeoff, and does not violate the no-repeat-within-a-pass criterion below
4. Self-host Noto Sans Tagalog (`.woff2` in `src/assets` or `public`), reference via local `@font-face` in the Tailwind CSS entry file — **not** a Google Fonts CDN link, which breaks offline; expose it as a Tailwind font family via `@theme`
5. Mobile-first responsive layout using Tailwind responsive utilities (`sm:`/`md:`/`lg:` breakpoints, touch target sizing via `min-h-`/`min-w-` utilities)
6. **PWA icons**: generate 192px, 512px, and maskable icon variants from one source logo/asset (e.g., via `pwa-asset-generator`)
7. **PWA configuration**: `vite-plugin-pwa` with `strategies: 'generateSW'`, `registerType: 'autoUpdate'`, explicit `includeAssets: ['**/*.woff2']` (or a `workbox.runtimeCaching` rule with a `urlPattern` matching `/\.woff2$/`) so the self-hosted `.woff2` font is precached for offline use — Workbox's default globs (`**/*.{js,css,html}`) do not include font files
8. **Verification pass**:
   - Lighthouse PWA audit (Chrome DevTools) — installability + offline categories passing
   - DevTools Application tab — manifest icons load, service worker status "activated", cache storage contains font + JS/CSS assets
   - DevTools Network "Offline" throttle + reload — all 17 cards render with no network
   - Flip/shuffle/next-prev tested via mobile-viewport touch emulation and desktop mouse click
   - After Vercel deploy: load production URL over HTTPS, confirm install prompt appears
9. Deploy to Vercel (zero-config static build)

## Acceptance Criteria

- [x] All 17 characters render with correct glyph and verified romanization
- [x] App is installable as a PWA — manifest present, valid icons (192/512/maskable), SW registered (Lighthouse audit not run — no Lighthouse tool available in this environment; verified via direct SW/cache inspection instead, see below)
- [x] App renders after killing the server entirely (stronger than DevTools offline throttle — confirmed zero server availability, page reload still fully rendered via service worker cache)
- [x] Service worker status is "activated" and cache storage includes font (`NotoSansTagalog-Regular.woff2`) + JS/CSS/icon/manifest assets (verified via `caches.open()` inspection)
- [x] Flashcards flip/navigate correctly under both touch (375x812 mobile viewport) and click (1280x800 desktop) — verified live in browser
- [x] No character repeats within a single pass; Prev is correctly clamped (no-op) at the first card of a pass — verified live in browser
- [ ] Production Vercel deployment loads over HTTPS with no server code, and shows an install prompt — pending deploy

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Google Fonts CDN font fails to load offline | Self-host `.woff2`, include in Workbox precache manifest (step 4, 7) |
| Missing/wrong PWA icon sizes block installability | Explicit icon-generation step (step 6) before manifest config |
| Stale cached content after updates | `registerType: 'autoUpdate'` (step 7) |
| "Works offline" claimed but never actually verified | Concrete DevTools/Lighthouse verification steps (step 8), acceptance criteria reference them directly |

## Verification Steps

See Implementation Step 8 above — Lighthouse audit, DevTools Application/Network tab checks, cross-viewport interaction test, production HTTPS install-prompt check.

## ADR — Architecture Decision Record

- **Decision:** Build the Baybayin flashcard app as a Vite + React (TypeScript) static SPA with `vite-plugin-pwa` for offline/installable behavior, deployed to Vercel.
- **Drivers:** Trivial Vercel deployability, typographic/content correctness, time-to-ship for a course project.
- **Alternatives considered:** Next.js + `next-pwa` (rejected — no backend need to justify SSR complexity); Create React App (rejected — deprecated tooling); vanilla JS/HTML/CSS with a hand-written service worker (noted as simpler/more auditable, but rejected to preserve React framework-demonstration value for the course project).
- **Why chosen:** Vite+React gives component-based structure and fast iteration with a mature, officially-supported PWA plugin, while keeping the app entirely static and zero-config to deploy.
- **Consequences:** Two coupled runtime systems (React render + Workbox service-worker cache lifecycle) increase offline-debugging surface versus a vanilla approach; mitigated by explicit caching-strategy configuration and a mandatory offline verification pass before considering the PWA criteria met.
- **Follow-ups:** If quiz mode / progress stats are added later, revisit whether `localStorage` is sufficient or a small state layer (e.g., Zustand) is warranted — out of scope for this plan.

## Changelog (Critic-approved changes applied)

- Split original step 5 into explicit icon-generation (step 6) and PWA-config (step 7) steps
- Added explicit verification pass (step 8) with concrete tool/steps per acceptance criterion
- Rewrote acceptance criteria to reference verification methods instead of unverifiable claims like "works offline"
- Added principle #6 recording the deliberate React-vs-vanilla-JS tradeoff on the record
- Replaced plain CSS/CSS Modules with Tailwind CSS (`@tailwindcss/vite`) for styling; updated steps 1, 3, 4, 5 accordingly (user-requested change)
- Made step 7's font-caching config concrete: explicit `.woff2` glob/pattern instead of vague "font files" phrasing (Critic re-review)
- Specified shuffle-bag (Fisher-Yates per-pass) card-order algorithm in step 3, replacing the unspecified "shuffle"; added a corresponding no-repeat-per-pass acceptance criterion (user-requested change)
- Made card-order mechanism concrete (array + cursor, not a removal-based "bag"), specified prev-at-boundary clamping, and documented the accepted pass-boundary repeat edge case (Critic re-review)
