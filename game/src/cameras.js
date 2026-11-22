// Velvet Hour — the wall-mounted security cameras.
// A camera sits on a wall and sweeps its cone back and forth. It cannot
// move, but it never blinks: while the thief stands in its cone with a
// clear line of sight the alarm climbs. A jammer shuts every camera down
// for a while; smoke blinds a camera the same way it blinds a guard.
import {
  CAMERA_SIGHT_RANGE,
  CAMERA_CONE_HALF_ANGLE,
  CAMERA_SWEEP_SPEED,
} from './config.js';
import { hasLineOfSight, pointInCone, pointInShadowZone } from './sight.js';

export function createCameras(spawns) {
  return spawns.map((spawn) => ({
    x: spawn.x,
    y: spawn.y,
    baseAngle: spawn.baseAngle,
    sweep: spawn.sweep,
    phase: spawn.phase,
    angle: spawn.baseAngle,
    time: spawn.phase,
    jammedUntil: 0,
  }));
}

export function updateCamera(camera, dt, now) {
  camera.time += dt;
  // Sine sweep: the cone glides out and back, so its turn is readable.
  camera.angle = camera.baseAngle + Math.sin(camera.time * CAMERA_SWEEP_SPEED) * camera.sweep;
  camera.jammed = now < camera.jammedUntil;
}

// Returns true while this camera can currently see the thief.
export function cameraCanSee(camera, player, blockers, shadowZones, smokeClouds) {
  if (camera.jammed) return false;
  let range = CAMERA_SIGHT_RANGE;
  if (player.sneaking && pointInShadowZone(player.x, player.y, shadowZones)) range *= 0.65;
  const dist = Math.hypot(player.x - camera.x, player.y - camera.y);
  if (dist > range) return false;
  if (!pointInCone(camera.x, camera.y, camera.angle, range, CAMERA_CONE_HALF_ANGLE, player.x, player.y)) {
    return false;
  }
  if (!hasLineOfSight(camera.x, camera.y, player.x, player.y, blockers)) return false;
  if (smokeClouds.some((cloud) => Math.hypot(player.x - cloud.x, player.y - cloud.y) < cloud.radius)) {
    return false;
  }
  return true;
}

export function jamAllCameras(cameras, now, durationSeconds) {
  for (const camera of cameras) {
    camera.jammedUntil = now + durationSeconds;
  }
}
