# Icons

The PWA manifest (`vite.config.ts`) references these icon paths:

- `/icon.svg`               — primary SVG icon (single-file, scalable)
- `/icon-192.png`           — 192×192 PNG (Chrome, install prompts)
- `/icon-512.png`           — 512×512 PNG (Android splash, app stores)
- `/icon-maskable-512.png`  — 512×512 PNG, maskable (Android adaptive icons)
- `/apple-touch-icon.png`   — 180×180 PNG (iOS home-screen icon)

The SVGs ship in this folder. **You need to export PNG versions** before
publishing because:
- iOS Safari requires PNG for `apple-touch-icon`
- Some PWA install validators require raster icons

## Generating the PNGs

### Option A — `pwa-asset-generator` (recommended)

One command does all sizes plus iOS splash screens:

```bash
npx pwa-asset-generator public/icon.svg public \
  --background "#0d0d11" \
  --padding "10%" \
  --icon-only \
  --type png \
  --manifest none
```

### Option B — ImageMagick or rsvg-convert

```bash
# Install once on macOS
brew install librsvg

# Convert
rsvg-convert -w 192 -h 192 public/icon.svg            -o public/icon-192.png
rsvg-convert -w 512 -h 512 public/icon.svg            -o public/icon-512.png
rsvg-convert -w 512 -h 512 public/icon-maskable.svg   -o public/icon-maskable-512.png
rsvg-convert -w 180 -h 180 public/icon.svg            -o public/apple-touch-icon.png
```

### Option C — Online tool

Upload `public/icon.svg` to https://realfavicongenerator.net and replace
the contents of `public/` with the bundle it produces.

## Replacing the placeholder icon

The current "BS" mark is a placeholder built into `icon.svg` /
`icon-maskable.svg`. Replace those two SVG files with your real brand
mark (keep them at the 512×512 viewBox; keep the maskable variant inside
the central 80% safe zone), then re-run the export commands above.
