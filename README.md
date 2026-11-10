# Lucky Lounge

A minimal yellow-and-green virtual casino with seven games: Roulette, Slot Machine, Blackjack, Dice Duel, Coin Flip, Crash, and Lucky Number.

## Rules

- Each new daily run starts with 200 virtual coins.
- The minimum bet is 10 coins in every game.
- If your balance falls below 10 coins after a round, you lose for the day and a score of 0 is submitted.
- Cashing out submits your remaining balance and ends your run for the day.
- After losing or cashing out, that browser/device shows only the leaderboard until the next local calendar day.
- For development/debugging only: while the daily lock screen is showing, press **U** ten times to clear the local lock and reload the game.

The daily restriction is stored in that browser's localStorage. It is suitable as a casual device-level restriction, not as an anti-cheat or identity system. Clearing browser storage, using private browsing, or switching browsers/devices can bypass it.

## Run locally

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Supabase leaderboard

1. Create a Supabase project.
2. Run `supabase.sql` in the Supabase SQL Editor.
3. In `config.js`, set `SUPABASE_URL` to your project's API URL and `SUPABASE_ANON_KEY` to its **Publishable** key (`sb_publishable_...`). Do not put a database password or Secret key in this file.
4. Deploy the folder contents to GitHub Pages, Netlify, or another static host.

The publishable key is intended to be used in browser code. Database permissions still need to be configured correctly in Supabase. The game engine and score submission run in the browser, so a technically skilled visitor can manipulate a score. Do not attach real-money prizes or treat this as a secure competition; that requires server-side game logic and score validation.

## Notes

Virtual coins only; no deposits or cash prizes. Player names appear publicly on the leaderboard, so players should avoid using sensitive personal information.
