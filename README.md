# KCM2026 — Kate's November Adventure

KCM2026 is a static, browser-based birthday adventure for November 2026. Each day reveals another region of a painted world map, unlocks a location scene and interactive object, and ends with a personal message and linked voucher.

## Run locally

Open `index.html` directly for a quick preview. The page loads `js/app.bundle.js`, so it works from a local `file://` URL without JavaScript module restrictions.

Serving the directory is recommended while developing:

```sh
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Calendar and preview days

The live adventure runs from November 1 through November 30, 2026. `js/date.js` currently sets `DEVELOPMENT_DAY` to `1` for testing. Change it to `null` before launch to restore the real calendar.

Query parameters override both the live date and `DEVELOPMENT_DAY`:

- `?day=0` — pre-launch locked state
- `?day=1` — Day 1 only
- `?day=12` — reveal Days 1–12
- `?day=30` — reveal the complete map and unlock every quest

Consider removing the query override before launch if recipients should not be able to preview future days.

## Completion data

Completed quests are stored in browser `localStorage` under `kcm2026.completedQuests`. During testing, the temporary **Reset test progress** button clears this data after confirmation. To reset testing progress, run this in the browser console and refresh:

```js
localStorage.removeItem('kcm2026.completedQuests');
```

## Adventure journal

The book icon in the fourth status slot opens a six-page completion-aware journal. Page 1 groups the six voucher types and reveals each daily code only after that quest is complete. Pages 2–6 contain the 30 after-click scene images in groups of six; incomplete entries remain locked.

Purchased voucher codes are entered in the `voucherCodes` configuration near the top of `js/app.js`. Regenerate `js/app.bundle.js` after changing them, as with any source JavaScript change.

## Content and artwork

- All 30 landmarks have dedicated base and after-click scene artwork.
- Active scene artwork, the world map, and the Day 1 letter use optimized WebP files.
- Voucher graphics remain PNG files under `assets/art/vouchers/` for crisp text and logos.
- Day 1 shows `Letter.webp` three seconds after the mailbox reveal. Closing the letter opens the reward modal.
- Day 30 uses a full-frame transition from the farm entrance to the adventurer meeting the horse.
- Fog and marker positions are percentage-based and advance with the selected calendar day.

Voucher URLs in `js/data/quests.js` are provisional and must be replaced with purchased voucher links before delivery.

## Project structure

```text
index.html                 App shell, map, scenes and modal markup
css/styles.css             Responsive layout, parchment, fog and transitions
js/app.js                  Source controller and interaction flow
js/app.bundle.js           Local-file-compatible browser bundle
js/date.js                 Live date and preview-day calculation
js/storage.js              Completion persistence
js/data/quests.js          Quest content, coordinates, messages and vouchers
assets/art/                World map, scene and letter artwork
assets/art/vouchers/       Voucher images
```

## Quest data

Each landmark in `js/data/quests.js` defines its day, map position, artwork, reveal region, clickable hotspot, story prompt, reward and voucher assignment. Coordinates use percentages (`x`, `y`, `w`, `h`) so markers and interaction areas scale with the artwork.

After changing a source JavaScript file, regenerate `js/app.bundle.js` before testing through `index.html`, because the local page loads the bundle rather than the ES-module source files.

## Before launch

1. Replace every provisional voucher URL with the purchased link.
2. Set `DEVELOPMENT_DAY` to `null` in `js/date.js`.
3. Decide whether to retain the `?day=N` override.
4. Clear stored completion data and test Days 1–30.
5. Verify every voucher link in the final delivery environment.
6. Test the layout on the intended desktop and mobile browsers.
