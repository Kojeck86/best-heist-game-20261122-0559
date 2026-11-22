// Velvet Hour — the gallery guards.
// A guard walks a patrol loop, turns at each waypoint, and watches a vision
// cone. When the thief is inside the cone with a clear line of sight the
// guard turns alert, raises the alarm and gives chase. Lose sight for a
// while and the guard calms down and returns to patrol.
import {
  GUARD_RADIUS,
  GUARD_PATROL_SPEED,
  GUARD_CHASE_SPEED,
  GUARD_SIGHT_RANGE,
  GUARD_SNEAK_SIGHT_RANGE,
  GUARD_CONE_HALF_ANGLE,
  GUARD_CLOSE_SPOT_RANGE,
} from './config.js';
import { hasLineOfSight, pointInCone, pointInShadowZone, moveCircle } from './sight.js';

const ALERT_MEMORY_SECONDS = 3.5;

export function createGuards(spawns) {
  return spawns.map((spawn) => {
    const start = spawn.waypoints[spawn.startIndex];
    const next = spawn.waypoints[(spawn.startIndex + 1) % spawn.waypoints.length];
    return {
      name: spawn.name,
      x: start.x,
      y: start.y,
      angle: Math.atan2(next.y - start.y, next.x - start.x),
      waypoints: spawn.waypoints,
      waypointIndex: (spawn.startIndex + 1) % spawn.waypoints.length,
      alert: false,
      alertTimer: 0,
      lastSeenX: start.x,
      lastSeenY: start.y,
    };
  });
}

// Returns true while this guard can currently see the thief.
export function guardCanSee(guard, player, blockers, shadowZones, smokeClouds) {
  const sneaking = player.sneaking;
  let range = sneaking ? GUARD_SNEAK_SIGHT_RANGE : GUARD_SIGHT_RANGE;
  if (pointInShadowZone(player.x, player.y, shadowZones)) range *= 0.7;
  const dist = Math.hypot(player.x - guard.x, player.y - guard.y);
  if (dist < GUARD_CLOSE_SPOT_RANGE) {
    return hasLineOfSight(guard.x, guard.y, player.x, player.y, blockers);
  }
  if (dist > range) return false;
  if (!pointInCone(guard.x, guard.y, guard.angle, range, GUARD_CONE_HALF_ANGLE, player.x, player.y)) {
    return false;
  }
  if (!hasLineOfSight(guard.x, guard.y, player.x, player.y, blockers)) return false;
  // Smoke swallows sight: if either end sits inside a cloud, vision is gone.
  if (smokeClouds.some((cloud) => insideSmoke(guard, cloud) || insideSmoke(player, cloud))) {
    return false;
  }
  return true;
}

function insideSmoke(point, cloud) {
  return Math.hypot(point.x - cloud.x, point.y - cloud.y) < cloud.radius;
}

export function updateGuard(guard, dt, player, blockers, shadowZones, smokeClouds) {
  const sees = guardCanSee(guard, player, blockers, shadowZones, smokeClouds);
  if (sees) {
    guard.alert = true;
    guard.alertTimer = ALERT_MEMORY_SECONDS;
    guard.lastSeenX = player.x;
    guard.lastSeenY = player.y;
  } else if (guard.alertTimer > 0) {
    guard.alertTimer -= dt;
    if (guard.alertTimer <= 0) guard.alert = false;
  }

  if (guard.alert) {
    // Chase the last place the thief was seen, not the thief's live spot:
// a guard who rounds the corner after you hid must search, not home in.
    const dx = guard.lastSeenX - guard.x;
    const dy = guard.lastSeenY - guard.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 8) {
      guard.angle = Math.atan2(dy, dx);
      const step = (GUARD_CHASE_SPEED * dt) / dist;
      const moved = moveCircle(guard.x, guard.y, dx * step, dy * step, GUARD_RADIUS, blockers);
      guard.x = moved.x;
      guard.y = moved.y;
    }
    return sees;
  }

  // Patrol: walk to the next waypoint, then turn toward the one after it.
  const target = guard.waypoints[guard.waypointIndex];
  const dx = target.x - guard.x;
  const dy = target.y - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 6) {
    guard.waypointIndex = (guard.waypointIndex + 1) % guard.waypoints.length;
    const next = guard.waypoints[guard.waypointIndex];
    guard.angle = Math.atan2(next.y - guard.y, next.x - guard.x);
    return sees;
  }
  guard.angle = Math.atan2(dy, dx);
  const step = (GUARD_PATROL_SPEED * dt) / dist;
  const moved = moveCircle(guard.x, guard.y, dx * step, dy * step, GUARD_RADIUS, blockers);
  guard.x = moved.x;
  guard.y = moved.y;
  return sees;
}

// A guard who touches the thief makes the catch.
export function guardCaughtPlayer(guard, player) {
  return Math.hypot(guard.x - player.x, guard.y - player.y) < GUARD_RADIUS + 13;
}
