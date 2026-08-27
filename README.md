# Fairway Draft Board

A dice-driven golf season simulator for a projected 2028 PGA Tour Championship Series — built as a companion to a football dice simulator.

## Run it

The whole app is one self-contained static file: **[`output/app.html`](output/app.html)**. Open it directly in a browser, or serve the repo with any static file server. It needs no build step to run — everything (rosters, real World Ranking starting points, point tables) is embedded inline.

## Rebuild the data

If you change the roster, point tables, or simulation logic, regenerate `output/app.html`:

```bash
node build-app-data.js   # rebuilds output/app-data.json — the 120-man roster, all
                          # 16 tournament fields, real OWGR starting points, and one
                          # seeded trial run (AT&T Pebble Beach Pro-Am + the Masters)
node render-app.js       # embeds app-data.json into app-template.html -> output/app.html
```

## What's in here

- **`data/players.js`** — the fixed 120-man Championship Series roster, the real Korn Ferry Tour / DP World Tour depth pool (172 players), past-major-champion exemption lists, and the name bank for PGA Championship club-pro qualifiers.
- **`points.js`** — real point tables sourced from [OWGR event pages](https://www.owgr.com/events/the-154th-open-11468) (World Ranking points by finish) and the [FedEx Cup point distribution](https://en.wikipedia.org/wiki/List_of_point_distributions_of_the_FedEx_Cup) (Championship Series season points), real starting World Ranking averages (ranks 1–30 exact, tail power-law fit beyond that), the dice definitions, and cut-line sizes per tournament.
- **`sim.js`** — the player registry and major-field construction rules (Masters/PGA/U.S. Open/Open Championship exemption categories, past champions, random qualifiers).
- **`build-app-data.js`** — assembles all 16 tournament fields in real chronological order and runs the one seeded trial (Pebble Beach → Masters), including the round 1–2 cut.
- **`app-template.html`** — the actual app: dice roller, Round 1–4 score entry (with live cut projection and sortable/tied leaderboards), a live tab per tournament, a season-long Championship Series points board, and a live World Ranking (average points, ÷40, starting from the real OWGR snapshot).
- **`render-app.js`** — embeds `output/app-data.json` into `app-template.html` to produce the final `output/app.html`.

## How the app works

- **Dice**: 4 dice with fixed face distributions (Eagle/Birdie/Par/Bogey/Double Bogey, plus Triple Bogey on the 100-sided one). Roll one, then key the resulting to-par score into a player's round.
- **Round 1–4**: pick a tournament, and its real field auto-populates. Round 1 starts in field order; rounds 2–4 default to sorting by the previous round's leaderboard. Click "Pos." to toggle between field order and score-sorted (with ties shown as "T-").
- **The cut**: after round 2, the field cuts to the top scores + ties — 65 by default, 50 at the Masters, 60 at the U.S. Open and Open Championship, 70 at THE PLAYERS. Players outside the line are locked out of rounds 3–4 and score 0 toward both point boards.
- **Championship Series**: season points (FedEx Cup-style, reset to 0 each season) from the 11 Championship Series events, THE PLAYERS, and the four majors.
- **World Ranking**: real OWGR-style average points — total points ÷ 40 — starting from the real current snapshot and moving with every tournament result entered.

State (scores, dice rolls, round selections) is saved to the browser's local storage automatically — it's per-browser and not synced anywhere.
