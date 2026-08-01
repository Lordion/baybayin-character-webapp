# Baybayin Flashcards

An installable, offline-first Progressive Web App for studying the 17 base characters of **Baybayin**, the pre-colonial Philippine script — 3 vowels and 14 consonants, rendered in native script via a self-hosted webfont.

## Features

- All 17 base Baybayin characters (Unicode Tagalog block `U+1700`–`U+1711`), each with romanization and a short note
- Each card randomly prompts with either the glyph or the romanization side; tap/click (or `Space`) flips it to reveal the other
- Leitner-style self-grading: once flipped, mark a card **Hard** or **Easy** (or press `1`/`2`) to move it down or up through 5 mastery boxes
- Progress is persisted per-character in `localStorage` (with an in-memory fallback if storage is unavailable), so mastery carries over between sessions
- Tiered shuffle-bag ordering — cards are grouped by their current box, shuffled within each box, and dealt low-box-first, so lower-mastery characters surface earlier in each pass while every character still appears exactly once per pass before reshuffling
- Fully responsive, mobile-first layout
- Installable PWA that works completely offline after the first load (including the custom script font)
- Zero backend — a static site with no server-side code

## How It Works

1. The app deals cards from a **tiered shuffle-bag**: characters are bucketed into 5 boxes by mastery (box 1 = least mastered), each box is shuffled independently, and the boxes are dealt low-to-high. This front-loads weaker characters within a pass while still showing every character exactly once before reshuffling for the next pass.
2. For each card, the prompt side (glyph or romanization) is chosen at random.
3. Tap/click the card, or press `Space`, to flip it and reveal the other side.
4. Once flipped, grade yourself with the **Hard** or **Easy** button (or `1`/`2`) — Easy moves the character up a box (max box 5), Hard moves it down a box (min box 1).
5. Grades are written to `localStorage` immediately, so mastery per character persists across reloads and future sessions; boxes are read fresh at the start of each pass so grading during a pass affects the next one.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Build tool | [Vite](https://vite.dev/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`) |
| PWA / offline | [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/) (Workbox `generateSW`) |
| Script font | [Noto Sans Tagalog](https://fonts.google.com/noto/specimen/Noto+Sans+Tagalog) (self-hosted, [SIL OFL 1.1](https://scripts.sil.org/OFL)) |
| Deployment | [Vercel](https://vercel.com/) (static build, zero config) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+ and npm

### Installation

```bash
git clone <this-repo-url>
cd baybayin-character-webapp
npm install
```

### Development

```bash
npm run dev
```

Opens the app at `http://localhost:5173` with hot module reload. Note: the service worker/PWA behavior is **disabled** in dev mode by design — use the production preview below to test PWA features.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) and build a production bundle to `dist/` |
| `npm run preview` | Serve the production build locally (this registers the service worker) |
| `npm run lint` | Run [Oxlint](https://oxc.rs/) |

## Testing the PWA / Offline Behavior

Dev mode won't show PWA behavior — build and preview instead:

```bash
npm run build
npm run preview
```

Then, in Chrome DevTools on the preview URL:

1. **Application → Manifest** — confirm name, theme color, and all three icons (192px, 512px, maskable) load
2. **Application → Service Workers** — status should read "activated and is running"
3. **Network → Offline** checkbox, then reload — the app should render fully with no network requests succeeding
4. **Application → Cache Storage** — confirm the precache includes the JS/CSS bundle, the manifest, all icons, and `NotoSansTagalog-Regular.woff2`
5. Click the install icon in the address bar (or **Application → Manifest → "Add to homescreen"**) to test installation
6. Run a **Lighthouse** PWA audit for a final installability/offline score

## Project Structure

```
public/
  favicon.svg
  fonts/NotoSansTagalog-Regular.woff2   # self-hosted script font (required for offline rendering)
  pwa-192x192.png
  pwa-512x512.png
  pwa-maskable-512x512.png
src/
  data/characters.json     # all 17 characters: glyph, romanization, category, notes
  hooks/useShuffleBag.ts   # tiered (box-aware) shuffle-bag card ordering
  lib/progress.ts          # 5-box Leitner progress, persisted to localStorage
  components/Flashcard.tsx # flip card UI
  types.ts                 # BaybayinCharacter type
  App.tsx                  # app shell: grading, keyboard shortcuts, flip state
  index.css                # Tailwind entry + self-hosted @font-face
  main.tsx                 # React entry point
vite.config.ts             # Tailwind + vite-plugin-pwa configuration
```

## The Character Set

| Glyph | Romanization | Type |
|---|---|---|
| ᜀ | A | Vowel |
| ᜁ | E / I | Vowel |
| ᜂ | O / U | Vowel |
| ᜃ | KA | Consonant |
| ᜄ | GA | Consonant |
| ᜅ | NGA | Consonant |
| ᜆ | TA | Consonant |
| ᜇ | DA / RA | Consonant |
| ᜈ | NA | Consonant |
| ᜉ | PA | Consonant |
| ᜊ | BA | Consonant |
| ᜋ | MA | Consonant |
| ᜌ | YA | Consonant |
| ᜎ | LA | Consonant |
| ᜏ | WA | Consonant |
| ᜐ | SA | Consonant |
| ᜑ | HA | Consonant |

Each consonant carries an inherent `/a/` vowel sound, per traditional Baybayin usage.

## Deployment

This is a static build with no server-side code, so it deploys to [Vercel](https://vercel.com/) with zero configuration:

```bash
npx vercel        # first deploy: log in, link/create project, get a preview URL
npx vercel --prod  # promote to production
```

Alternatively, push this repo to GitHub and import it from the [Vercel dashboard](https://vercel.com/new) — Vite is auto-detected.

## License

No license has been chosen yet for this project. Add a `LICENSE` file before any public release if you intend to open-source it.

The bundled **Noto Sans Tagalog** font is licensed separately under the [SIL Open Font License 1.1](https://scripts.sil.org/OFL).
