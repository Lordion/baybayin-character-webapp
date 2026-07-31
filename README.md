# Baybayin Flashcards

An installable, offline-first Progressive Web App for studying the 17 base characters of **Baybayin**, the pre-colonial Philippine script — 3 vowels and 14 consonants, rendered in native script via a self-hosted webfont.

## Features

- All 17 base Baybayin characters (Unicode Tagalog block `U+1700`–`U+1711`), each with romanization and a short note
- Tap/click to flip a card between glyph and romanization
- Shuffle-bag card ordering — every character appears once before any repeats, then reshuffles for the next pass
- Fully responsive, mobile-first layout
- Installable PWA that works completely offline after the first load (including the custom script font)
- Zero backend — a static site with no server-side code

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
  hooks/useShuffleBag.ts   # Fisher-Yates shuffle-bag card ordering
  components/Flashcard.tsx # flip card UI
  types.ts                 # BaybayinCharacter type
  App.tsx                  # app shell: progress, navigation, flip state
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
