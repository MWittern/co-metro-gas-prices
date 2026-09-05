# CO Metro Gas Prices

Static installable **PWA** that shows the cheapest **regular** and **premium** gas stations across **Centennial**, **Greenwood Village**, and **Littleton**, Colorado.

No login. No build step. Vanilla HTML / CSS / JS.

**Repo:** https://github.com/jackcsu1/co-metro-gas-prices

## What you see

After each refresh the app loads `data/prices.json` and displays:

1. Cheapest **regular** station (name, address/city, price, reported time if known)
2. Cheapest **premium** station (same fields)
3. Last snapshot time (America/Denver) plus when you opened/refreshed the page
4. Optional short list of other cheap stations

## Data snapshot

Published file: [`data/prices.json`](data/prices.json)

Schema (abridged):

```json
{
  "updatedAt": "ISO-8601 UTC",
  "updatedAtDenver": "human-readable America/Denver",
  "note": "optional banner text (used for SAMPLE data)",
  "regular": { "station", "brand", "address", "city", "price", "reported", "url" },
  "premium": { "station", "brand", "address", "city", "price", "reported", "url" },
  "stations": [ { "grade", "station", "brand", "address", "city", "price", "reported", "url" } ]
}
```

The repo ships with clearly labeled **SAMPLE / PLACEHOLDER** data so the UI works before the first live update.

### Live updates (separate routine)

Live prices are intended to come from a **Grok Bot** routine that browses **GasBuddy** about every **12 hours** (unofficial; subject to GasBuddy ToS and breakage risk) and commits an updated `data/prices.json`. This repository only hosts the publishable PWA + snapshot file — it does **not** contain the scrape implementation.

## Run locally

From the repo root (any static file server):

```bash
# Python
python3 -m http.server 8080

# or npx
npx --yes serve -l 8080
```

Open http://localhost:8080

Service workers need `http://localhost` or HTTPS.

## Deploy — GitHub Pages (recommended)

1. Push `main` (already contains the static site at the **repo root**).
2. On GitHub: **Settings → Pages**.
3. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: `main` / folder: **/ (root)**
4. Save. After a minute or two the site is at:

   `https://jackcsu1.github.io/co-metro-gas-prices/`

   (For a private repo, GitHub Pages may require a paid plan or you can use Cloudflare Pages instead.)

### Cloudflare Pages (alternative)

1. Log in at [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → connect GitHub.
2. Select `jackcsu1/co-metro-gas-prices`.
3. Build settings:
   - Framework preset: **None**
   - Build command: *(leave empty)*
   - Build output directory: `/` (or `.`)
4. Deploy. Cloudflare gives you a `*.pages.dev` URL; you can add a custom domain later.

Optional Wrangler (if the project is linked):

```bash
npx wrangler pages deploy . --project-name=co-metro-gas-prices
```

Do **not** commit secrets (API tokens, Cloudflare keys, etc.).

## Add to Home Screen (install the PWA)

### iPhone / iPad (Safari)

1. Open the deployed site in **Safari**.
2. Tap the **Share** button.
3. Tap **Add to Home Screen**.
4. Confirm the name → **Add**.

### Android (Chrome)

1. Open the site in **Chrome**.
2. Tap the menu (⋮) → **Install app** / **Add to Home screen**, or use the install banner if shown.
3. Confirm.

Once installed, the app opens fullscreen (standalone) and can show the last cached snapshot offline.

## Project layout

```
├── index.html
├── styles.css
├── app.js
├── sw.js                 # service worker
├── manifest.webmanifest
├── icons/                # placeholder PWA icons
├── data/prices.json      # published price snapshot
└── README.md
```

## Disclaimer

Unofficial convenience snapshot. Not affiliated with GasBuddy. Prices may be stale or wrong; always verify at the pump.
