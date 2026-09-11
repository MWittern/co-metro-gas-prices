# Matt's Gas

One-tap regular/premium prices for Centennial, Littleton, Greenwood Village, and Englewood. Opens Waze.

## Scrape: local MattFetch (Mac)

`mattfetch.py` runs on the Mac via `launchd` at 07:15 and 17:15 America/Denver.
It calls GasBuddy's GraphQL endpoint through **py-gasbuddy** (no HTML, no Firecrawl),
appends one observation to `gas-history.json`, and pushes to this repo so Pages updates.

The GitHub Actions workflow (`.github/workflows/daily-gas.yml`) is **disabled** and kept
as a manual fallback only.

### One-time setup

```bash
cd ~/mattfetch   # or wherever you cloned this repo
python3 -m venv .venv && source .venv/bin/activate
pip install py-gasbuddy
# store a fine-grained PAT (contents:write) in Keychain:
security add-generic-password -s mattsgas-pat -a $USER -w <token>
# install the LaunchAgent:
cp com.mattsgas.mattfetch.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.mattsgas.mattfetch.plist
```

### Tracked stations (11)

I-Mart 250 E Dry Creek · Exxon 6556 S Broadway · Shell 8020 S Broadway ·
King Soopers 8250 S Holly · QuikTrip 7801 E Arapahoe · Murphy USA 12022 E Arapahoe ·
Sinclair 7500 S Broadway · Conoco 7450 S Colorado Blvd ·
King Soopers 8080 S Broadway · Shell 6200 S Santa Fe Dr.

### Phone

Open the GitHub Pages URL in Safari → Share → Add to Home Screen.
