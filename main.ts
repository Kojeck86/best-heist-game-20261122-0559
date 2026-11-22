// Velvet Hour — the hand-in program for the best-heist-game bounty.
// Node 22, standard library only. It takes this repository's game/ and
// screenshots/ and writes them into the output directory together with a
// dossier.json built by the vendored make.fun library, which is what the
// judge reads. Run it as: MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Mirror the playable game and the screenshots into the output folder.
// The game is copied first so a missing game/ fails loudly here, before
// the dossier is built from an incomplete output directory.
mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// Build the dossier with the same caps the scorer enforces, so a local run
// fails the same way the gate would instead of silently passing a bad entry.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
