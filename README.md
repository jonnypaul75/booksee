# BookSee.App

Mobile-first OTT player UI for **BookSee.App** — built in React + TypeScript with a dark, 3D glassmorphic theme. The UI ships with mock content, fixed header and footer, five-tab navigation, a WhatsApp-status-style shorts player, and a YouTube-style long-format player.

> ⚠️ This is the **UI scaffold only**. Real audio/video URLs, auth, payments and analytics are stubbed and ready to be wired in.

## Quick start

```bash
npm install
npm run dev
```

Then open the printed URL on a phone (or in Chrome DevTools' mobile emulator at iPhone 14 width).

## Stack

| Concern | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Bundler | Vite |
| Styling | Hand-written CSS with CSS variables (no Tailwind required) |
| Icons | Inline outline SVG (`src/components/Icons.tsx`) |
| Data | Mock data in `src/data/mockData.ts` |

## Folder layout

```
src/
  App.tsx                      ← tab routing, popup & player state
  main.tsx                     ← React entry
  styles/global.css            ← dark theme + glassmorphism
  types/index.ts               ← shared TS types
  data/mockData.ts             ← stub content, languages, default user
  components/
    Header.tsx                 ← fixed header with Logo
    Footer.tsx                 ← fixed 5-tab bottom nav
    Logo.tsx                   ← logo placeholder (see "Replacing the logo")
    Icons.tsx                  ← outline icon set
  pages/
    ShortsPage.tsx             ← 9:16 grid (2/row) + genre chips + lazy load
    LongFormatPage.tsx         ← 16:9 list (1/row) + autoplay preview
    SearchPage.tsx             ← unified search (shorts + long)
    LanguagePopup.tsx          ← bottom-sheet language selector
    ProfilePage.tsx            ← details, subscription, preferences, T&C, privacy, logout, version
  players/
    ShortsPlayer.tsx           ← WhatsApp-status-style player
    LongFormatPlayer.tsx       ← YouTube-style player + related list
```

## Theme

The dark theme is defined entirely with CSS variables at the top of `src/styles/global.css`:

- `--bs-bg` — page black (`#000`)
- `--bs-red` / `--bs-orange` / `--bs-white` — accent palette
- `--bs-glass-bg`, `--bs-glass-border`, `--bs-glass-shadow`, `--bs-glass-blur` — the 3D glassmorphism mix

Edit those values to retune the look without touching components.

## Footer tabs

| # | Tab | Behaviour |
|---|---|---|
| 1 | **Shorts** | Default selected. 9:16 posters, 2 per row, genre filter chips, lazy load on scroll. |
| 2 | **Long** | 16:9 posters, 1 per row. Each row autoplays a muted preview when in view. |
| 3 | **Search** | Single input searches both shorts and long format by title/author/genre. |
| 4 | **Language** | Opens a bottom-sheet language selector; does not change tab. |
| 5 | **Profile** | Personal details, payment & subscription, preferences (default language + genre), T&C, Privacy, Logout, App version. |

## Players

**Shorts player** (`src/players/ShortsPlayer.tsx`):
- Tap left/right thirds → previous/next episode within a story
- Tap center → pause/resume
- Swipe up → next story · Swipe down → previous story
- Top progress bars indicate episode progress

**Long format player** (`src/players/LongFormatPlayer.tsx`):
- 16:9 player on top with play/pause, scrubber and volume/fullscreen
- Title, metadata, action pills (Like, Share, Save, Add to List)
- "Up Next" related-content list at the bottom

## Replacing the logo

Two ways:

1. **Per use** — drop a file in `public/` and pass it as a prop:
   ```tsx
   <Logo src="/your-logo.png" />
   ```

2. **Globally** — open `src/components/Logo.tsx` and set:
   ```ts
   const defaultSrc = '/your-logo.png';
   ```
   Every `<Logo />` will pick it up automatically.

The placeholder shows the word "LOGO" inside a glassy rounded square so the slot is obvious during development.

## Wiring real media

Mock entries reference `picsum.photos` for posters. To switch to real video:

- Set `videoUrl` on entries in `src/data/mockData.ts`
- In `ShortsPlayer.tsx`, swap the `<img>` inside `.bs-shorts-episode` for `<video autoPlay muted loop playsInline src={ep.videoUrl} />`
- `LongFormatPlayer.tsx` already conditionally renders a `<video>` when `item.videoUrl` is present
- `LongFormatPage.tsx` already auto-plays muted previews when a row scrolls into view

## What's stubbed / next steps

- Auth flow + real logout
- Payment & subscription screens (only menu shells exist)
- Real T&C / Privacy copy (placeholders in `ProfilePage.tsx`)
- Real video URLs and analytics
- i18n string extraction tied to the language selector
