# MACO Rush (Three.js, multi-page)

Pages: index.html (home), connect.html (wallet), characters.html (hero viewer + shop),
market.html (keys, time, power-ups, boosts), leaderboard.html (weekly + all-time), game.html (the game).

## Run it
Serve the folder over http(s); opening index.html straight from disk will block the .glb downloads.
  cd maco-rush && python3 -m http.server 8080     ->  http://localhost:8080
Three.js and fonts load from jsDelivr / Google Fonts, so you need to be online.
Wallet connection needs a real domain (https) or localhost.

## Demo mode (default)
config.js has no TREASURY and no API_BASE, so the site runs in DEMO mode: a "demo wallet" button
appears on connect.html, purchases are simulated, and progress is stored in the browser.
Every page shows a demo banner while this is on.

## Going live (config.js)
- CHAIN_ID / CHAIN_NAME / RPC_URL / EXPLORER : the EVM chain MACO is on
- TREASURY : wallet that receives MACO payments
- API_BASE : your edge function base URL (see EDGE-API.md)
- WC_PROJECT_ID : WalletConnect Project ID (free at dashboard.reown.com). Add your site's domain to the project's allowed list.
  If it is empty, tapping WalletConnect on connect.html asks for the ID once and remembers it in the browser.
MACO_ADDRESS is already set to the contract you shared.
When TREASURY and API_BASE are both set, DEMO mode turns off automatically:
purchases send a real ERC-20 transfer of MACO to TREASURY, then the tx hash is sent to your
edge function to verify and credit.

## Editing the shop
assets/catalog.js: prices (in MACO), pack sizes, characters. Each character has height, rot (degrees,
turn it if a model runs backwards), fit ('bbox' or 'bones') and k (extra scale multiplier) if a model looks too big/small.

## Music
assets/audio/run-loop.mp3 plays during a run, pauses on pause/crash, and follows the Sound toggle.

## Notes
- Characters download only when selected (characters page) or equipped (game).
- Model files are large (inspector 14.7 MB, rider 10.5 MB). For faster loading, compress them with gltf-transform/gltfpack (WebP textures, Draco/meshopt) before launch.
- Frontend only: scores and time are trusted from the browser in demo mode. In production the edge function must own time, purchases and leaderboard validation.

## Character tuning (assets/catalog.js)
- height: how tall the runner is in game units (cars are about 2.3).
- rot: degrees to turn the model if it runs backwards (0 or 180).
- k: extra scale multiplier if one still looks too big or small.
- still:true: show the model in its resting pose instead of playing its animation (used for Desert Inspector).
- Sprinter, Nova Rider and Desert Inspector .glb files were repaired for three.js (unsupported material extensions removed).
