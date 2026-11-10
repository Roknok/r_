# Lucky Lounge

A responsive, light-themed virtual casino with seven playable games:
- Roulette (red/black 1:1, green 14:1)
- Three-reel slots (three of a kind 5:1, three sevens 10:1, two matching 2:1)
- Blackjack (win 2:1, natural blackjack 2.5:1, tie returns stake)
- Dice high/low (2:1)
- Coin flip (2:1)
- Crash (cash out before the randomly selected crash point)
- Lucky number (exact guess 1–10 pays 8:1)

All games share one 200-coin balance. Cash-out submits one score; zero coins automatically ends the run with score 0. Re-entering starts a fresh run.

## Run locally

Open `index.html` in a browser, or serve the folder:
```bash
python3 -m http.server 8000
```
Then visit http://localhost:8000.

It works immediately in demo mode. Demo leaderboard data is saved in localStorage and is only visible in the same browser.

## Enable the global leaderboard with Supabase

1. Create a free project at https://supabase.com.
2. In the SQL Editor, run the contents of `supabase.sql`.
3. Open `config.js` and set `SUPABASE_URL` and `SUPABASE_ANON_KEY` from Project Settings → API.
4. Deploy the folder to Netlify, GitHub Pages, or another static host.

### Important fairness/security note

This starter uses a browser-side game engine and submits the final score from the browser. Supabase makes the leaderboard shared globally, but it does **not** make scores cheat-proof: a technically skilled visitor can alter client code or submit a fabricated score. Do not describe this as a secure competitive leaderboard or attach prizes to it. For a tamper-resistant competition, move game state, random outcomes, and score submission into trusted server-side code (for example, Supabase Edge Functions with server-issued run IDs and server-side game actions), and add rate limits / abuse controls.

The SQL enables public score reads and inserts. It includes basic input constraints, but it cannot verify that a score was earned legitimately.

## Deploy free

### Netlify
Drag the `lucky_lounge` folder into https://app.netlify.com/drop, or connect a GitHub repository containing these files.

### GitHub Pages
Push the folder contents to a GitHub repository, then enable Pages in Settings → Pages. It is a static site, so no build command is required.

## Notes
- Virtual coins only; no deposits, cash prizes, or real-money gambling.
- Player names are public on the leaderboard. Tell players not to use sensitive personal information.
