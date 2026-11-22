// Velvet Hour — the game loop and state machine.
// Phases: 'title' -> 'playing' -> 'caught' | 'win', with R to restart and
// Enter or click to start and to play again. The loop owns the alarm meter,
// loot pickups, the smoke and jammer tools, and the getaway exit.
import {
  CANVAS_W,
  CANVAS_H,
  PLAYER_RADIUS,
  PLAYER_WALK_SPEED,
  PLAYER_SNEAK_SPEED,
  ALARM_RISE_PER_SECOND,
  ALARM_CAMERA_RISE_PER_SECOND,
  ALARM_DECAY_PER_SECOND,
  ALARM_WARNING_LEVEL,
  ALARM_LOCKDOWN_LEVEL,
  SMOKE_DURATION_SECONDS,
  JAMMER_DURATION_SECONDS,
  SMOKE_COST_SCORE,
  JAMMER_COST_SCORE,
  MAIN_LOOT_NAME,
} from './config.js';
import {
  buildWalls,
  buildCover,
  buildShadowZones,
  buildLoot,
  buildSmokePickups,
  buildGuardSpawns,
  buildCameraSpawns,
  PLAYER_SPAWN,
  EXIT_DOOR,
} from './level.js';
import { createInput } from './input.js';
import { createGuards, updateGuard, guardCaughtPlayer } from './guards.js';
import { createCameras, updateCamera, cameraCanSee, jamAllCameras } from './cameras.js';
import { createAudio } from './audio.js';
import { moveCircle, pointInRect } from './sight.js';
import { drawWorld, drawTitle, drawCaught, drawWin } from './render.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = createInput(canvas);
const audio = createAudio();

let state = null;

function freshState() {
  const walls = buildWalls();
  const cover = buildCover();
  const solids = [...walls, ...cover.map((c) => ({ x: c.x, y: c.y, w: c.w, h: c.h }))];
  return {
    phase: 'title',
    time: 0,
    elapsed: 0,
    score: 0,
    alarm: 0,
    visibility: 'HIDDEN',
    objective: `Steal the ${MAIN_LOOT_NAME} from the vault, then reach the west exit.`,
    walls,
    cover,
    solids,
    shadowZones: buildShadowZones(),
    loot: buildLoot(),
    smokePickups: buildSmokePickups(),
    guards: createGuards(buildGuardSpawns()),
    cameras: createCameras(buildCameraSpawns()),
    smokeClouds: [],
    smokeCount: 1,
    jammerReady: false,
    exitArmed: false,
    exit: EXIT_DOOR,
    player: {
      x: PLAYER_SPAWN.x,
      y: PLAYER_SPAWN.y,
      sneaking: false,
      moving: false,
    },
    moveTarget: null,
    caughtReason: '',
    spottedFlash: 0,
  };
}

// Demo presets for screenshots: ?demo=play | alert | win | caught
// puts the game into a real, rendered state straight from its own code.
function applyDemoPreset() {
  const demo = new URLSearchParams(window.location.search).get('demo');
  if (!demo) return;
  state.phase = 'playing';
  if (demo === 'play') {
    state.player.x = 430;
    state.player.y = 340;
    state.score = 550;
    state.elapsed = 47;
    state.alarm = 45;
    state.loot[0].taken = true;
    state.loot[1].taken = true;
    state.smokeCount = 2;
    state.objective = `The ${MAIN_LOOT_NAME} waits in the vault — cross the hall unseen.`;
  } else if (demo === 'alert') {
    state.player.x = 500;
    state.player.y = 260;
    state.score = 800;
    state.elapsed = 96;
    state.alarm = 82;
    state.visibility = 'SEEN!';
    state.loot[0].taken = true;
    state.loot[2].taken = true;
    state.guards[0].x = 560;
    state.guards[0].y = 300;
    state.guards[0].alert = true;
    state.guards[0].lastSeenX = 500;
    state.guards[0].lastSeenY = 260;
    state.objective = 'Spotted! Break line of sight and let the alarm fall.';
  } else if (demo === 'win') {
    state.phase = 'win';
    state.score = 2350;
    state.elapsed = 143;
    state.alarm = 41;
    for (const item of state.loot) item.taken = true;
  } else if (demo === 'caught') {
    state.phase = 'caught';
    state.score = 800;
    state.elapsed = 88;
    state.alarm = 100;
    state.caughtReason = 'The alarm hit 100% — the gallery locked down around you.';
    state.guards[0].x = state.player.x + 24;
    state.guards[0].y = state.player.y;
  }
}

function resetGame() {
  state = freshState();
  state.phase = 'playing';
  audio.unlock();
}

function startPlaying() {
  audio.unlock();
  audio.click();
  if (state.phase === 'title') {
    state.phase = 'playing';
  } else if (state.phase === 'caught' || state.phase === 'win') {
    resetGame();
  }
}

function updatePlayer(dt) {
  const player = state.player;
  const vec = input.moveVector();
  player.sneaking = input.isSneaking();
  const speed = player.sneaking ? PLAYER_SNEAK_SPEED : PLAYER_WALK_SPEED;
  let dx = 0;
  let dy = 0;
  if (vec.x !== 0 || vec.y !== 0) {
    dx = vec.x * speed * dt;
    dy = vec.y * speed * dt;
    state.moveTarget = null;
    input.clearClickTarget();
  } else {
    const target = input.takeClickTarget();
    if (target) state.moveTarget = target;
    if (state.moveTarget) {
      const mx = state.moveTarget.x - player.x;
      const my = state.moveTarget.y - player.y;
      const dist = Math.hypot(mx, my);
      if (dist < 6) {
        state.moveTarget = null;
      } else {
        dx = (mx / dist) * speed * dt;
        dy = (my / dist) * speed * dt;
      }
    }
  }
  player.moving = dx !== 0 || dy !== 0;
  const moved = moveCircle(player.x, player.y, dx, dy, PLAYER_RADIUS, state.solids);
  player.x = moved.x;
  player.y = moved.y;
}

function collectLoot() {
  const player = state.player;
  for (const item of state.loot) {
    if (item.taken) continue;
    if (Math.hypot(item.x - player.x, item.y - player.y) < 26) {
      item.taken = true;
      state.score += item.value;
      audio.pickup();
      if (item.main) {
        state.exitArmed = true;
        state.objective = 'The Opal is yours! Get to the west exit before the alarm climbs.';
      } else {
        state.objective = `Nice — $${item.value} tucked away. The ${MAIN_LOOT_NAME} is still in the vault.`;
      }
    }
  }
  for (const pickup of state.smokePickups) {
    if (pickup.taken) continue;
    if (Math.hypot(pickup.x - player.x, pickup.y - player.y) < 26) {
      pickup.taken = true;
      state.smokeCount += 1;
      audio.pickup();
      state.objective = 'Smoke pellet picked up — press Q to vanish in a cloud.';
    }
  }
}

function useTools() {
  if (input.wasPressed('q') && state.smokeCount > 0) {
    state.smokeCount -= 1;
    state.smokeClouds.push({ x: state.player.x, y: state.player.y, radius: 90, left: SMOKE_DURATION_SECONDS });
    audio.smoke();
  }
  if (input.wasPressed('1') && state.score >= SMOKE_COST_SCORE) {
    state.score -= SMOKE_COST_SCORE;
    state.smokeCount += 1;
    audio.pickup();
    state.objective = 'Bought a smoke pellet for $150. Press Q to use it.';
  }
  if (input.wasPressed('2') && state.score >= JAMMER_COST_SCORE && !state.jammerReady) {
    state.score -= JAMMER_COST_SCORE;
    jamAllCameras(state.cameras, state.time, JAMMER_DURATION_SECONDS);
    state.jammerReady = true;
    audio.jammer();
    state.objective = 'Jammer bought for $300 — every camera is blind for 10 seconds.';
  }
}

function updateAlarm(dt, seenByGuard, seenByCamera) {
  const wasSeen = seenByGuard || seenByCamera;
  if (seenByGuard) state.alarm += ALARM_RISE_PER_SECOND * dt;
  else if (seenByCamera) state.alarm += ALARM_CAMERA_RISE_PER_SECOND * dt;
  else state.alarm = Math.max(0, state.alarm - ALARM_DECAY_PER_SECOND * dt);

  if (wasSeen && state.visibility !== 'SEEN!') audio.spotted();
  state.visibility = seenByGuard || seenByCamera ? 'SEEN!' : state.alarm >= ALARM_WARNING_LEVEL ? 'SUSPICIOUS' : 'HIDDEN';
  if (state.alarm >= ALARM_WARNING_LEVEL) audio.startAlarmPulse();
  else audio.stopAlarmPulse();

  if (state.alarm >= ALARM_LOCKDOWN_LEVEL) {
    state.alarm = ALARM_LOCKDOWN_LEVEL;
    state.phase = 'caught';
    state.caughtReason = 'The alarm hit 100% — the gallery locked down around you.';
    audio.stopAlarmPulse();
    audio.caught();
  }
}

function updatePlaying(dt) {
  state.elapsed += dt;
  state.time += dt;
  updatePlayer(dt);
  useTools();
  collectLoot();

  // Smoke clouds shrink away over their lifetime.
  for (const cloud of state.smokeClouds) cloud.left -= dt;
  state.smokeClouds = state.smokeClouds.filter((cloud) => cloud.left > 0);

  let seenByGuard = false;
  let seenByCamera = false;
  for (const guard of state.guards) {
    if (updateGuard(guard, dt, state.player, state.solids, state.shadowZones, state.smokeClouds)) {
      seenByGuard = true;
    }
    if (guardCaughtPlayer(guard, state.player)) {
      state.phase = 'caught';
      state.caughtReason = `${guard.name} caught you in the open — too close, too slow.`;
      audio.stopAlarmPulse();
      audio.caught();
      return;
    }
  }
  for (const camera of state.cameras) {
    updateCamera(camera, dt, state.time);
    if (cameraCanSee(camera, state.player, state.solids, state.shadowZones, state.smokeClouds)) {
      seenByCamera = true;
    }
  }
  if (state.jammerReady && state.cameras.every((camera) => !camera.jammed)) {
    state.jammerReady = false;
  }

  updateAlarm(dt, seenByGuard, seenByCamera);
  if (state.phase !== 'playing') return;

  // The getaway: the west exit only opens once the Opal is taken.
  if (state.exitArmed && pointInRect(state.player.x, state.player.y, state.exit)) {
    state.phase = 'win';
    audio.stopAlarmPulse();
    audio.win();
  }
}

function frame(timestamp) {
  requestAnimationFrame(frame);
  const now = timestamp / 1000;
  const dt = Math.min(0.05, now - (frame.last || now));
  frame.last = now;

  if (input.wasPressed('r')) {
    resetGame();
  } else if (input.wasPressed('enter')) {
    startPlaying();
  } else {
    const click = input.takeClickTarget();
    if (click && state.phase !== 'playing') startPlaying();
    else if (click) state.moveTarget = click;
  }

  if (state.phase === 'playing') updatePlaying(dt);
  else state.time += dt;

  if (state.phase === 'title') drawTitle(ctx, state);
  else if (state.phase === 'caught') drawCaught(ctx, state);
  else if (state.phase === 'win') drawWin(ctx, state);
  else drawWorld(ctx, state);

  input.endFrame();
}

state = freshState();
applyDemoPreset();
// A read-only handle for automated play-tests: phase, score, alarm and the
// thief's position, nothing that can change the game from outside.
window.velvetHour = {
  getState() {
    return {
      phase: state.phase,
      score: state.score,
      alarm: Math.round(state.alarm),
      visibility: state.visibility,
      playerX: Math.round(state.player.x),
      playerY: Math.round(state.player.y),
      exitArmed: state.exitArmed,
      lootTaken: state.loot.filter((item) => item.taken).length,
      guards: state.guards.map((g) => ({ x: Math.round(g.x), y: Math.round(g.y), alert: g.alert })),
      cameras: state.cameras.map((c) => ({ x: c.x, y: c.y, jammed: !!c.jammed })),
    };
  },
};
// When the tab hides, drop the frame clock so the thief does not lose
// seconds (or gain alarm) to a paused tab when the player comes back.
document.addEventListener('visibilitychange', () => {
  frame.last = null;
});
requestAnimationFrame(frame);
