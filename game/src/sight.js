// Velvet Hour — line-of-sight geometry shared by guards and cameras.
// Sight is blocked by walls and by cover pieces; a shadow zone only shrinks
// the range, it never blocks sight outright.
export function pointInRect(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h;
}

export function segmentHitsRect(x1, y1, x2, y2, rect) {
  // Quick reject: both ends on the same outside side.
  if ((x1 < rect.x && x2 < rect.x) || (x1 > rect.x + rect.w && x2 > rect.x + rect.w)) return false;
  if ((y1 < rect.y && y2 < rect.y) || (y1 > rect.y + rect.h && y2 > rect.y + rect.h)) return false;
  if (pointInRect(x1, y1, rect) || pointInRect(x2, y2, rect)) return true;
  // Check the segment against each of the rectangle's four edges.
  const edges = [
    [rect.x, rect.y, rect.x + rect.w, rect.y],
    [rect.x + rect.w, rect.y, rect.x + rect.w, rect.y + rect.h],
    [rect.x + rect.w, rect.y + rect.h, rect.x, rect.y + rect.h],
    [rect.x, rect.y + rect.h, rect.x, rect.y],
  ];
  return edges.some(([ax, ay, bx, by]) => segmentsCross(x1, y1, x2, y2, ax, ay, bx, by));
}

function segmentsCross(x1, y1, x2, y2, x3, y3, x4, y4) {
  const d1 = direction(x3, y3, x4, y4, x1, y1);
  const d2 = direction(x3, y3, x4, y4, x2, y2);
  const d3 = direction(x1, y1, x2, y2, x3, y3);
  const d4 = direction(x1, y1, x2, y2, x4, y4);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

function direction(ax, ay, bx, by, cx, cy) {
  return (cx - ax) * (by - ay) - (bx - ax) * (cy - ay);
}

// True when nothing solid stands between two points.
export function hasLineOfSight(x1, y1, x2, y2, blockers) {
  return !blockers.some((rect) => segmentHitsRect(x1, y1, x2, y2, rect));
}

// True when a target sits inside a vision cone of given range and half-angle.
export function pointInCone(ox, oy, angle, range, halfAngle, tx, ty) {
  const dx = tx - ox;
  const dy = ty - oy;
  const dist = Math.hypot(dx, dy);
  if (dist > range) return false;
  if (dist < 1) return true;
  let diff = Math.atan2(dy, dx) - angle;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return Math.abs(diff) <= halfAngle;
}

export function pointInShadowZone(x, y, shadowZones) {
  return shadowZones.some((zone) => pointInRect(x, y, zone));
}

// Slide a circle along a movement delta against solid rectangles.
// Axis-separated so the thief slides along a wall instead of sticking to it.
export function moveCircle(x, y, dx, dy, radius, solids) {
  let nx = x + dx;
  let ny = y + dy;
  for (const rect of solids) {
    if (circleHitsRect(nx, y, radius, rect)) nx = x;
    if (circleHitsRect(nx, ny, radius, rect)) ny = y;
  }
  return { x: nx, y: ny };
}

function circleHitsRect(cx, cy, radius, rect) {
  const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy < radius * radius;
}
