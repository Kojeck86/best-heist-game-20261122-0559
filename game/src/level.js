// Velvet Hour — the Marlowe Gallery floor plan.
// One open floor split into three zones by partition walls, with two doors
// between each pair of zones so every room offers several routes. Crates,
// planters and pedestals are cover: they block guard and camera sight.
// Shadow rugs are dark patches where a sneaking thief is harder to spot.
import { CANVAS_W, CANVAS_H } from './config.js';

// Every wall is an axis-aligned rectangle {x, y, w, h}.
export function buildWalls() {
  const walls = [];
  const T = 18; // outer wall thickness
  walls.push({ x: 0, y: 0, w: CANVAS_W, h: T }); // north
  walls.push({ x: 0, y: CANVAS_H - T, w: CANVAS_W, h: T }); // south
  walls.push({ x: 0, y: 0, w: T, h: CANVAS_H }); // west
  walls.push({ x: CANVAS_W - T, y: 0, w: T, h: CANVAS_H }); // east

  // Partition between the entry lobby and the gallery hall (x = 300).
  // Two door gaps: one near the top, one near the bottom.
  walls.push({ x: 300, y: 0, w: 14, h: 190 });
  walls.push({ x: 300, y: 260, w: 14, h: 150 });
  walls.push({ x: 300, y: 480, w: 14, h: CANVAS_H - 480 });

  // Partition between the gallery hall and the vault room (x = 640).
  // Again two gaps, staggered so no straight corridor runs end to end.
  walls.push({ x: 640, y: 0, w: 14, h: 120 });
  walls.push({ x: 640, y: 190, w: 14, h: 220 });
  walls.push({ x: 640, y: 480, w: 14, h: CANVAS_H - 480 });
  return walls;
}

// Cover pieces block sight. kind: 'crate' | 'plant' | 'pedestal'.
export function buildCover() {
  return [
    // Entry lobby: a crate lane along the south wall, a planter by the door.
    { kind: 'crate', x: 60, y: 470, w: 74, h: 54 },
    { kind: 'crate', x: 150, y: 500, w: 60, h: 46 },
    { kind: 'plant', x: 250, y: 60, w: 44, h: 44 },
    { kind: 'pedestal', x: 130, y: 200, w: 52, h: 52 },
    // Gallery hall: a central island of crates with planters on the flanks.
    { kind: 'crate', x: 400, y: 150, w: 80, h: 60 },
    { kind: 'crate', x: 400, y: 400, w: 80, h: 60 },
    { kind: 'plant', x: 560, y: 90, w: 46, h: 46 },
    { kind: 'plant', x: 560, y: 470, w: 46, h: 46 },
    { kind: 'pedestal', x: 470, y: 270, w: 56, h: 56 },
    // Vault room: crates guarding the Opal plinth from three sides.
    { kind: 'crate', x: 700, y: 120, w: 66, h: 52 },
    { kind: 'crate', x: 700, y: 430, w: 66, h: 52 },
    { kind: 'plant', x: 880, y: 90, w: 46, h: 46 },
    { kind: 'plant', x: 880, y: 470, w: 46, h: 46 },
    { kind: 'pedestal', x: 830, y: 250, w: 56, h: 56 },
  ];
}

// Dark rug patches: standing still and sneaking inside one shrinks the
// range at which guards and cameras can spot the thief.
export function buildShadowZones() {
  return [
    { x: 40, y: 330, w: 120, h: 90 },
    { x: 340, y: 40, w: 130, h: 80 },
    { x: 480, y: 480, w: 130, h: 80 },
    { x: 690, y: 250, w: 110, h: 100 },
    { x: 850, y: 330, w: 90, h: 90 },
  ];
}

// Loot pickups. The Opal is the main target; the rest is bonus score.
export function buildLoot() {
  return [
    { id: 'painting', kind: 'painting', x: 90, y: 90, value: 400, taken: false },
    { id: 'coins', kind: 'coins', x: 210, y: 330, value: 150, taken: false },
    { id: 'vase', kind: 'vase', x: 520, y: 300, value: 250, taken: false },
    { id: 'painting2', kind: 'painting', x: 600, y: 540, value: 400, taken: false },
    { id: 'coins2', kind: 'coins', x: 880, y: 200, value: 150, taken: false },
    { id: 'opal', kind: 'opal', x: 810, y: 300, value: 1000, taken: false, main: true },
  ];
}

// Smoke pellet pickups lying on the floor.
export function buildSmokePickups() {
  return [
    { x: 170, y: 140, taken: false },
    { x: 600, y: 200, taken: false },
  ];
}

export function buildGuardSpawns() {
  return [
    {
      name: 'Marlow',
      waypoints: [
        { x: 360, y: 120 },
        { x: 360, y: 480 },
        { x: 560, y: 480 },
        { x: 560, y: 120 },
      ],
      startIndex: 0,
    },
    {
      name: 'Iris',
      waypoints: [
        { x: 480, y: 300 },
        { x: 620, y: 300 },
        { x: 620, y: 90 },
        { x: 480, y: 90 },
      ],
      startIndex: 2,
    },
    {
      name: 'Dmitri',
      waypoints: [
        { x: 760, y: 120 },
        { x: 920, y: 120 },
        { x: 920, y: 480 },
        { x: 760, y: 480 },
      ],
      startIndex: 1,
    },
  ];
}

export function buildCameraSpawns() {
  return [
    { x: 314, y: 30, baseAngle: Math.PI / 2, sweep: 0.9, phase: 0 },
    { x: 654, y: 570, baseAngle: -Math.PI / 2, sweep: 1.0, phase: 1.4 },
    { x: 942, y: 300, baseAngle: Math.PI, sweep: 0.8, phase: 2.6 },
  ];
}

export const PLAYER_SPAWN = { x: 52, y: 300 };
export const EXIT_DOOR = { x: 18, y: 270, w: 26, h: 60 };
