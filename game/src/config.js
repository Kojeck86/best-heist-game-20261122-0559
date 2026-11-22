// Velvet Hour — shared tuning numbers for the whole game.
// Every other module reads from here so the feel of the heist can be
// balanced in one place: speeds, sight ranges, alarm rates and scores.
export const CANVAS_W = 960;
export const CANVAS_H = 600;

export const PLAYER_RADIUS = 13;
export const PLAYER_WALK_SPEED = 165;
export const PLAYER_SNEAK_SPEED = 92;
export const GUARD_RADIUS = 14;
export const GUARD_PATROL_SPEED = 62;
export const GUARD_CHASE_SPEED = 148;

export const GUARD_SIGHT_RANGE = 178;
export const GUARD_SNEAK_SIGHT_RANGE = 112;
export const GUARD_CONE_HALF_ANGLE = 0.61; // ~35 degrees each side
export const GUARD_CLOSE_SPOT_RANGE = 46; // inside this, a guard spots you even in shadow
export const CAMERA_SIGHT_RANGE = 205;
export const CAMERA_CONE_HALF_ANGLE = 0.5;
export const CAMERA_SWEEP_SPEED = 0.55;

export const ALARM_RISE_PER_SECOND = 46;
export const ALARM_CAMERA_RISE_PER_SECOND = 30;
export const ALARM_DECAY_PER_SECOND = 14;
export const ALARM_WARNING_LEVEL = 65;
export const ALARM_LOCKDOWN_LEVEL = 100;

export const SMOKE_DURATION_SECONDS = 6;
export const JAMMER_DURATION_SECONDS = 10;
export const SMOKE_COST_SCORE = 150;
export const JAMMER_COST_SCORE = 300;

export const LOOT_VALUES = {
  opal: 1000,
  painting: 400,
  vase: 250,
  coins: 150,
};

export const COLORS = {
  floorLight: '#2b2f3a',
  floorDark: '#262a33',
  rug: '#5a2e3d',
  rugEdge: '#7a3b4e',
  wall: '#14161d',
  wallTop: '#23262f',
  crate: '#6b4a2b',
  crateEdge: '#8a6238',
  plant: '#2e6b34',
  plantEdge: '#4c9a52',
  pedestal: '#3d3a4d',
  pedestalEdge: '#5c5878',
  shadow: 'rgba(8, 10, 18, 0.55)',
  coneCalm: 'rgba(255, 214, 90, 0.20)',
  coneAlert: 'rgba(255, 74, 74, 0.30)',
  cameraCone: 'rgba(120, 200, 255, 0.18)',
  loot: '#ffd94a',
  lootGlow: 'rgba(255, 217, 74, 0.35)',
  player: '#e8e4d8',
  playerHood: '#7a4fd0',
  guard: '#3f6fb5',
  guardAlert: '#e5484d',
  exit: '#37d67a',
  smoke: 'rgba(200, 200, 210, 0.45)',
};

export const GAME_TITLE = 'VELVET HOUR';
export const GAME_SUBTITLE = 'The Marlowe Gallery Heist';
export const PLAYER_NAME = 'Rook';
export const MAIN_LOOT_NAME = 'Sunburst Opal';
