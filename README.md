# Velvet Hour — The Marlowe Gallery Heist

[![make.fun](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/Kojeck86/best-heist-game-20261122-0559/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/Kojeck86/best-heist-game-20261122-0559/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

A complete 2D top-down heist game that runs offline in a desktop browser from
static files. You are **Rook**, a thief inside the Marlowe Gallery after
midnight. Steal the **Sunburst Opal** from the vault, grab whatever else you
can carry, and slip out the west door before the alarm locks the gallery down.

## How to play

Serve the `game/` folder with any static server and open `index.html`:

```sh
cd game && python3 -m http.server 8080
# open http://localhost:8080/
```

The gallery has three zones — lobby, hall and vault — joined by two doors
each, so every room offers several routes. Three guards patrol with visible
vision cones and three wall cameras sweep theirs. Crates, planters and
pedestals block sight; dark rugs are shadow where a sneaking thief is harder
to spot. Being seen raises the alarm; break line of sight and it falls again.
At 100% the gallery locks down and you are caught. A guard who touches you
catches you too — but a guard only chases the last place it saw you, so a
clean break is a fair escape.

Tools cost loot, so every gadget is a trade against your score — and a
jammer bought too early is $300 that could have been a bigger final total:

- **Smoke pellet (Q)** — vanish in a cloud for 6 seconds. You start with 1;
  two more lie on the floor, and `1` buys another for $150.
- **Camera jammer (2)** — blinds every camera for 10 seconds, $300.

Collecting the Opal unlocks the west exit. Reach it to win; a time bonus
rewards a fast, quiet getaway.

## Controls

| Key | Action |
| --- | --- |
| WASD / arrow keys | Move |
| Mouse click | Walk to that spot |
| Shift (hold) | Sneak — slower, harder to spot |
| Q | Drop a smoke pellet |
| 1 | Buy a smoke pellet ($150) |
| 2 | Buy a camera jammer ($300) |
| R | Restart |
| Enter / click | Start, and play again after a win or a catch |

## HUD

Loot collected, timer, alarm meter, visibility state (HIDDEN / SUSPICIOUS /
SEEN!), smoke count and jammer status, and the current objective.

## Sounds

All sound is synthesized with WebAudio — pickup chimes, a spotted sting, a
soft alarm pulse while the meter is high, and a getaway arpeggio. No audio
files, no network requests.

## Structure

- `game/index.html` — the page, canvas and script tag
- `game/src/config.js` — tuning: speeds, sight ranges, alarm rates, scores
- `game/src/level.js` — the gallery floor plan: walls, cover, loot, spawns
- `game/src/sight.js` — line-of-sight geometry and collision sliding
- `game/src/input.js` — keyboard and click-to-move input
- `game/src/guards.js` — patrols, vision cones, alerts and chases
- `game/src/cameras.js` — sweeping cameras and the jammer
- `game/src/audio.js` — WebAudio sound effects
- `game/src/render.js` — all canvas drawing: floor, cones, HUD, screens
- `game/src/main.js` — game loop, phases, alarm, tools, getaway
- `main.ts` — Node program that hands the game in (writes `dossier.json`)
- `vendor/makefun-game.ts` — the make.fun dossier library, unchanged

## License

MIT — see `LICENSE`.
