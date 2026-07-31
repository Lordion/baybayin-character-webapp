# Plan: Baybayin Flashcards Webapp + PWA

**Status:** base plan implemented — feature addition below pending approval

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

---

# Feature Addition: Leitner Spaced Repetition + Direction Randomization

**Status:** implemented and verified

## Requirements Summary

Extend the existing flashcard app with per-character Leitner-box progress tracking (persisted in `localStorage`), a tiered-shuffle draw order that gives boxes positional (not frequency) priority within each pass, randomized prompt direction (glyph-first vs romanization-first) per draw, and Hard/Easy grading buttons that replace the existing manual Next/Prev controls.

## Principles (extends base plan)

7. This is recency-priming, not true spaced-repetition-by-frequency — every character still appears exactly once per pass; box state only affects ordering within a pass, not how often a card is shown. State this honestly rather than marketing it as full SRS.
8. Box-1 clustering at the start of every pass, combined with independent per-draw direction randomization, means a struggling card may reappear early in consecutive passes with a different prompt side each time — this is intended front-loaded drilling behavior, not a bug.
9. Progress persistence must degrade gracefully — a `localStorage` failure (private browsing, quota, disabled storage) must never crash the app or block card grading; fall back to in-memory state for that session.
10. Box state is shared per character regardless of tested direction (not tracked separately per direction) — a deliberate simplicity tradeoff; it may under/overestimate true per-direction mastery, and should not be presented as bidirectional mastery tracking.

## Decision Drivers

1. Must not break the already-verified no-repeat-within-pass and offline/PWA acceptance criteria
2. Course-project scope — avoid floating-point ease-factor complexity (confirms earlier Leitner-over-SM2 choice)
3. Zero-backend constraint — `localStorage` is the only persistence option, must be resilient to failure

## Options Considered

- **Chosen — Tiered shuffle** (group by box, shuffle within tier, concatenate ascending): only viable way to give box state behavioral effect without duplicating cards within a pass (would break the verified no-repeat-within-pass invariant) or hard-gating by due date (rejected earlier for UX reasons on a small fixed deck).
- **Rejected — Within-pass duplication of low-box cards**: true frequency-based reinforcement, but breaks the already-verified/tested "each of 17 appears exactly once per pass" acceptance criterion — rejected as a regression of a shipped, tested guarantee.
- **Rejected — Hard due-date gating**: already rejected earlier in the base plan for the same UX reason; still applies here.
- **Rejected — Per-direction box tracking (34 states instead of 17)**: more accurate but doubles state complexity for a course-project scope; deliberately simplified to one shared box per character.

## Implementation Steps

10. **Rework `useShuffleBag.ts`** (structural rewrite, not additive): remove the `prev` action, `canGoPrev`, and the clamp-at-0 branch entirely from `BagAction`/the reducer/the hook's return object. Replace the `next` case's flat `shuffle(items)` call with a `tieredShuffle(items, getBox)` function: group items into 5 tiers by `getBox(item.id)`, Fisher-Yates shuffle within each tier, concatenate tiers in ascending box order (1→5).
11. **Add `src/lib/progress.ts`**: `ProgressStore` type (`Record<characterId, { box: 1-5; dueAt: number }>`), `loadProgress()`/`saveProgress()` wrapping all `localStorage` reads/writes in try/catch — on any failure, fall back to an in-memory store for the session (module-level variable) and never throw or block rendering. `getBox(id)` defaults unseen ids to box 1. On load, drop stored entries whose id is not in `characters.json`; ids present in `characters.json` but absent from storage default to box 1. `gradeCard(id, grade: 'hard' | 'easy')`: Easy promotes box (max 5) and advances `dueAt` per the interval table (now/1d/3d/7d/14d); Hard demotes box (min 1) and resets `dueAt` accordingly.
12. **Add prompt-direction randomization**: on each card draw (initial load and every `next()`), randomly select `promptSide: 'glyph' | 'romanization'` (50/50). Update `Flashcard`/`App.tsx` so the front renders whichever side was chosen and the flip reveals the other; the glyph always renders with the `font-baybayin` utility, romanization always in the default sans font, regardless of front/back position.
13. **Replace Next/Prev with Hard/Easy**: buttons appear only when `flipped === true`. Clicking either calls `gradeCard(current.id, grade)`, advances the shuffle-bag cursor via `next()`, resets `flipped` to `false`, and re-randomizes `promptSide` for the newly drawn card.
14. **Verification pass**:
    - Pin one character to box 1 and all others to box 3+ in `localStorage`, reload, and confirm the box-1 character's index in the tiered-shuffle draw order is near the front across repeated trials
    - Simulate `localStorage.setItem` throwing and confirm the app still renders and grading still advances state in-memory without crashing
    - Grade a character Easy/Hard repeatedly, reload the page, and confirm the box value persisted (read back via DevTools Application → Local Storage)
    - Confirm existing base-plan acceptance criteria (offline reload, no-repeat-within-pass, mobile/desktop interaction) still pass unaffected after this change

## Acceptance Criteria

- [x] Grading a card Hard or Easy updates its Leitner box and persists to `localStorage`; reloading the page preserves the box value (verified live: graded Easy, reloaded, box value intact)
- [x] Tiered shuffle groups by box and shuffles within tiers by construction (partition into 5 arrays covering all 17 items exactly once, no duplication/drop possible) — box-1/box-5 clamping verified live; full positional-priority behavior follows directly from the (type-checked, reviewed) partition logic
- [x] If `localStorage` writes throw (simulated via overriding `Storage.prototype.setItem`), the app does not crash and grading still advances card state in-memory for the session (verified live)
- [x] Prompt direction (glyph-first vs romanization-first) is randomized per draw; flipping always reveals the opposite side with correct font styling per side (verified live, including offline)
- [x] Hard/Easy buttons appear only after the card is flipped; clicking either grades, advances to the next card, and resets flip + direction state (verified live)
- [x] Manual Prev navigation is fully removed (no dead `prev`/`canGoPrev` code remaining in `useShuffleBag.ts`)
- [x] All previously-verified base-plan acceptance criteria still pass: rebuilt production bundle, killed the preview server entirely, reloaded — app rendered fully offline with a romanization-first card, no console errors

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| `localStorage` unavailable/throwing (private browsing, quota, disabled) | try/catch wrapping with graceful in-memory fallback (step 11) |
| Box-1 clustering + random direction could read as a bug rather than intended drilling | Explicitly documented as intended in principle #8 |
| Shared box per character may mask direction-specific weakness | Documented as an accepted, deliberate simplicity tradeoff (principle #10) |
| Framing this as "true spaced repetition" would overpromise | Explicitly framed as recency-priming in principle #7 |
| Future changes to `characters.json` could orphan/miss localStorage entries | Explicit load-time reconciliation stated in step 11 |
| Removing Prev is a UX regression from current free browsing | Confirmed intentional by user, matches real Anki's lack of undo |

## ADR Addendum

- **Decision**: Add Leitner-box spaced repetition (localStorage-persisted) with a tiered-shuffle draw order, randomized prompt direction, and Hard/Easy-driven advancement replacing manual Next/Prev.
- **Drivers**: Must not regress already-verified acceptance criteria; course-project simplicity scope; zero-backend constraint.
- **Alternatives considered**: within-pass duplication (rejected — breaks verified no-repeat invariant), hard due-date gating (rejected — bad UX on small fixed deck), per-direction box tracking (rejected — doubles state complexity for marginal gain at this scope).
- **Why chosen**: Tiered shuffle is the only mechanism that gives box state real behavioral effect without violating already-shipped, tested guarantees.
- **Consequences**: This is positional/recency-priming, not frequency-based SRS; free Prev-browsing is lost; localStorage-only persistence means no cross-device sync and no recovery if storage is cleared.
- **Follow-ups**: Consider a manual "reset progress" control; consider per-direction tracking if user feedback suggests the shared-box simplification is inadequate.

## Changelog

- Added Leitner box spaced-repetition system, tiered-shuffle integration, randomized prompt direction, and Hard/Easy grading flow (user-requested feature)
- Applied Critic-required edits: explicit reducer-rewrite step for `useShuffleBag`, `localStorage` try/catch fallback step + acceptance criterion, explicit "intended, not a bug" principle for box-1 clustering, `characters.json` migration/reconciliation note, and concrete/testable acceptance criteria replacing vague claims

---

## Changelog (Critic-approved changes applied)

- Split original step 5 into explicit icon-generation (step 6) and PWA-config (step 7) steps
- Added explicit verification pass (step 8) with concrete tool/steps per acceptance criterion
- Rewrote acceptance criteria to reference verification methods instead of unverifiable claims like "works offline"
- Added principle #6 recording the deliberate React-vs-vanilla-JS tradeoff on the record
- Replaced plain CSS/CSS Modules with Tailwind CSS (`@tailwindcss/vite`) for styling; updated steps 1, 3, 4, 5 accordingly (user-requested change)
- Made step 7's font-caching config concrete: explicit `.woff2` glob/pattern instead of vague "font files" phrasing (Critic re-review)
- Specified shuffle-bag (Fisher-Yates per-pass) card-order algorithm in step 3, replacing the unspecified "shuffle"; added a corresponding no-repeat-per-pass acceptance criterion (user-requested change)
- Made card-order mechanism concrete (array + cursor, not a removal-based "bag"), specified prev-at-boundary clamping, and documented the accepted pass-boundary repeat edge case (Critic re-review)
