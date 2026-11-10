# Roknok's Casino

A static HTML/CSS/JavaScript casino-style game with seven games and a Supabase global leaderboard (v5).

## What's included

- Roulette, Slot Machine, Blackjack, Dice Duel, Coin Flip, Crash, and Lucky Number
- New players start with 200 coins
- Minimum bet: 10 coins
- Player names are unique (case-insensitive)
- Supabase anonymous authentication keeps the same player signed in after a page refresh
- Player balances are stored in Supabase after every completed round
- A player can complete one run per India calendar day
- On the first visit of each new India calendar day, an existing player receives 100 coins; the remaining balance carries over
- The global leaderboard shows each player's best submitted score
- Flat buttons, solid-colour surfaces, and restrained hover scaling
- Roulette uses the correct European single-zero wheel order and red/black number mapping
- End-of-run leaderboard scores are taken from the saved database balance, including balances below 10 coins
- Blackjack handles player/dealer natural 21 correctly
- Ending a run retries the balance save and will not submit a stale score if the save fails

## Supabase setup (required for this version)

1. Open the Supabase project used by this site.
2. Go to **Authentication → Sign In / Providers** and enable **Anonymous Sign-Ins**.
3. Open **SQL Editor** and run the complete `supabase.sql` file included in this folder. This upgrades the existing `scores` table and creates the player profile/functions.
4. Keep the existing `config.js` values for the project's URL and **publishable** key. Do not put a secret key or database password in the website.
5. Upload all six project files to the GitHub Pages repository and commit/push the changes.
6. Open the website and hard-refresh (`Ctrl + Shift + R`).

For this v5 update, run the complete `supabase.sql` script again in SQL Editor. It replaces the `finish_player_run` function so the submitted leaderboard score comes from the saved player balance.

## Player identity note

The anonymous sign-in session is saved in that browser's site storage. Refreshing or reopening the site in the same browser keeps the player's name and balance. Clearing site data, using a private window, or switching browsers/devices creates a different anonymous player. This no-password setup does not provide account recovery across devices.

## Files

- `index.html` — page structure
- `style.css` — styling
- `app.js` — games, player session, balance persistence, and leaderboard
- `config.js` — Supabase project URL and publishable key
- `supabase.sql` — database upgrade and secure RPC functions
