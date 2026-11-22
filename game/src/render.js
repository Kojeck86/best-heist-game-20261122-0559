// Velvet Hour — everything the player sees, drawn on one canvas.
// The look is a midnight gallery: deep blue-grey floor, burgundy rugs,
// warm loot glow, pale thief against navy guards, yellow cones for calm
// watchers and red cones once a guard is alerted.
import { CANVAS_W, CANVAS_H, COLORS, GAME_TITLE, GAME_SUBTITLE, MAIN_LOOT_NAME } from './config.js';
import { GUARD_SIGHT_RANGE, GUARD_CONE_HALF_ANGLE, CAMERA_SIGHT_RANGE, CAMERA_CONE_HALF_ANGLE } from './config.js';

function drawFloor(ctx, time) {
  ctx.fillStyle = COLORS.floorLight;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  // Checker tiles, faint enough to read as a polished gallery floor.
  const tile = 60;
  ctx.fillStyle = COLORS.floorDark;
  for (let y = 0; y < CANVAS_H; y += tile) {
    for (let x = 0; x < CANVAS_W; x += tile) {
      if (((x + y) / tile) % 2 === 0) ctx.fillRect(x, y, tile, tile);
    }
  }
  void time;
}

function drawShadowZones(ctx, zones) {
  for (const zone of zones) {
    ctx.fillStyle = COLORS.rug;
    ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
    ctx.strokeStyle = COLORS.rugEdge;
    ctx.lineWidth = 3;
    ctx.strokeRect(zone.x + 2, zone.y + 2, zone.w - 4, zone.h - 4);
    ctx.fillStyle = COLORS.shadow;
    ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
  }
}

function drawWalls(ctx, walls) {
  for (const wall of walls) {
    ctx.fillStyle = COLORS.wall;
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.fillStyle = COLORS.wallTop;
    ctx.fillRect(wall.x, wall.y, wall.w, Math.min(4, wall.h));
  }
}

function drawCover(ctx, cover) {
  for (const piece of cover) {
    if (piece.kind === 'crate') {
      ctx.fillStyle = COLORS.crate;
      ctx.fillRect(piece.x, piece.y, piece.w, piece.h);
      ctx.strokeStyle = COLORS.crateEdge;
      ctx.lineWidth = 3;
      ctx.strokeRect(piece.x + 2, piece.y + 2, piece.w - 4, piece.h - 4);
      ctx.beginPath();
      ctx.moveTo(piece.x, piece.y);
      ctx.lineTo(piece.x + piece.w, piece.y + piece.h);
      ctx.moveTo(piece.x + piece.w, piece.y);
      ctx.lineTo(piece.x, piece.y + piece.h);
      ctx.stroke();
    } else if (piece.kind === 'plant') {
      ctx.fillStyle = COLORS.plant;
      ctx.beginPath();
      ctx.arc(piece.x + piece.w / 2, piece.y + piece.h / 2, piece.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = COLORS.plantEdge;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = COLORS.plantEdge;
      ctx.beginPath();
      ctx.arc(piece.x + piece.w / 2 - 8, piece.y + piece.h / 2 - 6, 6, 0, Math.PI * 2);
      ctx.arc(piece.x + piece.w / 2 + 9, piece.y + piece.h / 2 + 5, 6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = COLORS.pedestal;
      ctx.fillRect(piece.x, piece.y, piece.w, piece.h);
      ctx.strokeStyle = COLORS.pedestalEdge;
      ctx.lineWidth = 3;
      ctx.strokeRect(piece.x + 3, piece.y + 3, piece.w - 6, piece.h - 6);
      ctx.fillStyle = '#8f8aa8';
      ctx.beginPath();
      ctx.arc(piece.x + piece.w / 2, piece.y + piece.h / 2, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawExit(ctx, exit, armed, time) {
  const pulse = 0.6 + 0.4 * Math.sin(time * 4);
  ctx.fillStyle = armed ? COLORS.exit : '#3a5a44';
  ctx.fillRect(exit.x, exit.y, exit.w, exit.h);
  ctx.strokeStyle = armed ? `rgba(55, 214, 122, ${pulse})` : '#55705f';
  ctx.lineWidth = 3;
  ctx.strokeRect(exit.x - 2, exit.y - 2, exit.w + 4, exit.h + 4);
  ctx.fillStyle = armed ? '#0b2e1a' : '#9fb8a8';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.save();
  ctx.translate(exit.x + exit.w / 2, exit.y + exit.h / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(armed ? 'EXIT' : 'LOCKED', 0, 4);
  ctx.restore();
}

function drawLoot(ctx, loot, time) {
  for (const item of loot) {
    if (item.taken) continue;
    const bob = Math.sin(time * 3 + item.x) * 2;
    const cx = item.x;
    const cy = item.y + bob;
    ctx.fillStyle = COLORS.lootGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, item.main ? 22 : 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.loot;
    if (item.kind === 'opal') {
      ctx.beginPath();
      ctx.moveTo(cx, cy - 13);
      ctx.lineTo(cx + 11, cy);
      ctx.lineTo(cx, cy + 13);
      ctx.lineTo(cx - 11, cy);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff6c9';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 8);
      ctx.lineTo(cx + 5, cy - 1);
      ctx.lineTo(cx, cy + 4);
      ctx.lineTo(cx - 5, cy - 1);
      ctx.closePath();
      ctx.fill();
    } else if (item.kind === 'painting') {
      ctx.fillRect(cx - 12, cy - 9, 24, 18);
      ctx.fillStyle = '#7a3b4e';
      ctx.fillRect(cx - 8, cy - 5, 16, 10);
      ctx.strokeStyle = '#3a2a1a';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - 12, cy - 9, 24, 18);
    } else if (item.kind === 'vase') {
      ctx.beginPath();
      ctx.ellipse(cx, cy, 8, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#b8860b';
      ctx.fillRect(cx - 3, cy - 16, 6, 6);
    } else {
      ctx.beginPath();
      ctx.arc(cx - 5, cy, 6, 0, Math.PI * 2);
      ctx.arc(cx + 5, cy, 6, 0, Math.PI * 2);
      ctx.arc(cx, cy - 6, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawSmokePickups(ctx, pickups, time) {
  for (const pickup of pickups) {
    if (pickup.taken) continue;
    const pulse = 0.7 + 0.3 * Math.sin(time * 5 + pickup.x);
    ctx.fillStyle = `rgba(220, 220, 230, ${pulse})`;
    ctx.beginPath();
    ctx.arc(pickup.x, pickup.y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#555';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('S', pickup.x, pickup.y + 4);
  }
}

function drawSmokeClouds(ctx, clouds) {
  for (const cloud of clouds) {
    ctx.fillStyle = COLORS.smoke;
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cloud.x - cloud.radius * 0.4, cloud.y - 6, cloud.radius * 0.55, 0, Math.PI * 2);
    ctx.arc(cloud.x + cloud.radius * 0.4, cloud.y + 6, cloud.radius * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCone(ctx, x, y, angle, range, halfAngle, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - halfAngle, angle + halfAngle);
  ctx.closePath();
  ctx.fill();
}

function drawCameras(ctx, cameras) {
  for (const camera of cameras) {
    drawCone(ctx, camera.x, camera.y, camera.angle, CAMERA_SIGHT_RANGE, CAMERA_CONE_HALF_ANGLE, COLORS.cameraCone);
    ctx.fillStyle = camera.jammed ? '#777' : '#9fd8ff';
    ctx.fillRect(camera.x - 8, camera.y - 8, 16, 16);
    ctx.strokeStyle = '#e8f4ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(camera.x - 8, camera.y - 8, 16, 16);
    ctx.beginPath();
    ctx.moveTo(camera.x, camera.y);
    ctx.lineTo(camera.x + Math.cos(camera.angle) * 16, camera.y + Math.sin(camera.angle) * 16);
    ctx.stroke();
    if (camera.jammed) {
      ctx.fillStyle = '#ffd94a';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('JAMMED', camera.x, camera.y - 16);
    }
  }
}

function drawGuards(ctx, guards) {
  for (const guard of guards) {
    const fill = guard.alert ? COLORS.coneAlert : COLORS.coneCalm;
    drawCone(ctx, guard.x, guard.y, guard.angle, GUARD_SIGHT_RANGE, GUARD_CONE_HALF_ANGLE, fill);
    ctx.fillStyle = guard.alert ? COLORS.guardAlert : COLORS.guard;
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#dfe9ff';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Facing tick so the patrol direction reads at a glance.
    ctx.beginPath();
    ctx.moveTo(guard.x, guard.y);
    ctx.lineTo(guard.x + Math.cos(guard.angle) * 20, guard.y + Math.sin(guard.angle) * 20);
    ctx.stroke();
  }
}

// Name tags and alert marks are drawn in their own pass, after the walls
// and cover, so a guard standing behind a plant stays labelled.
function drawGuardLabels(ctx, guards) {
  for (const guard of guards) {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    const labelX = Math.max(28, Math.min(CANVAS_W - 28, guard.x));
    ctx.fillText(guard.name, labelX, guard.y - 20);
    if (guard.alert) {
      ctx.fillStyle = '#ff5a5a';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('!', guard.x, guard.y - 32);
    }
  }
}

function drawPlayer(ctx, player, time) {
  const bob = player.moving ? Math.sin(time * 14) * 1.5 : 0;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(player.x, player.y + 11, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.playerHood;
  ctx.beginPath();
  ctx.arc(player.x, player.y + bob, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.player;
  ctx.beginPath();
  ctx.arc(player.x, player.y + bob, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1a22';
  ctx.beginPath();
  ctx.arc(player.x - 3, player.y - 1 + bob, 1.6, 0, Math.PI * 2);
  ctx.arc(player.x + 3, player.y - 1 + bob, 1.6, 0, Math.PI * 2);
  ctx.fill();
  if (player.sneaking) {
    ctx.strokeStyle = '#b9a7ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(player.x, player.y + bob, 17, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawHud(ctx, state) {
  // Top bar.
  ctx.fillStyle = 'rgba(10, 12, 20, 0.85)';
  ctx.fillRect(0, 0, CANVAS_W, 52);
  ctx.fillStyle = '#f2ead8';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`LOOT  $${state.score.toLocaleString()}`, 16, 22);
  ctx.fillStyle = '#c8ccd8';
  ctx.font = '13px sans-serif';
  const minutes = Math.floor(state.elapsed / 60);
  const seconds = Math.floor(state.elapsed % 60).toString().padStart(2, '0');
  ctx.fillText(`TIME  ${minutes}:${seconds}`, 16, 42);

  // Alarm meter.
  const barX = 300;
  const barW = 260;
  ctx.fillStyle = '#3a2026';
  ctx.fillRect(barX, 14, barW, 16);
  const alarmColor = state.alarm >= 65 ? '#ff4a4a' : state.alarm >= 30 ? '#ffb84a' : '#37d67a';
  ctx.fillStyle = alarmColor;
  ctx.fillRect(barX, 14, (barW * Math.min(state.alarm, 100)) / 100, 16);
  ctx.strokeStyle = '#f2ead8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(barX, 14, barW, 16);
  ctx.fillStyle = '#f2ead8';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(`ALARM ${Math.floor(state.alarm)}%`, barX + barW + 10, 27);

  // Visibility state.
  const visibilityText = state.visibility;
  const visibilityColor =
    visibilityText === 'SEEN!' ? '#ff5a5a' : visibilityText === 'SUSPICIOUS' ? '#ffb84a' : '#37d67a';
  ctx.fillStyle = visibilityColor;
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(visibilityText, CANVAS_W - 16, 22);
  ctx.fillStyle = '#c8ccd8';
  ctx.font = '12px sans-serif';
  ctx.fillText(`Smoke ${state.smokeCount}  [Q]   Jammer ${state.jammerReady ? 'ready [2]' : '—'}`, CANVAS_W - 16, 42);
  ctx.textAlign = 'left';

  // Objective line.
  ctx.fillStyle = 'rgba(10, 12, 20, 0.7)';
  ctx.fillRect(0, CANVAS_H - 26, CANVAS_W, 26);
  ctx.fillStyle = '#e8d9a0';
  ctx.font = '13px sans-serif';
  ctx.fillText(state.objective, 16, CANVAS_H - 8);
}

function dimScreen(ctx) {
  ctx.fillStyle = 'rgba(6, 8, 16, 0.78)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
}

function centerText(ctx, text, y, font, color) {
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.fillText(text, CANVAS_W / 2, y);
}

export function drawTitle(ctx, state) {
  drawWorld(ctx, state);
  dimScreen(ctx);
  centerText(ctx, GAME_TITLE, 170, 'bold 64px Georgia, serif', '#f2d98c');
  centerText(ctx, GAME_SUBTITLE, 210, 'italic 22px Georgia, serif', '#c8ccd8');
  centerText(ctx, 'You are Rook, a thief in the Marlowe Gallery after midnight.', 270, '16px sans-serif', '#e8e4d8');
  centerText(ctx, `Steal the ${MAIN_LOOT_NAME}, grab what else you can, and slip out the west door.`, 296, '16px sans-serif', '#e8e4d8');
  centerText(ctx, 'Guards patrol with vision cones. Cameras sweep. Crates, plants and dark rugs hide you.', 322, '16px sans-serif', '#e8e4d8');
  centerText(ctx, 'Hold SHIFT to sneak. Click to walk somewhere. Q drops smoke. 1 buys smoke ($150), 2 buys a jammer ($300).', 348, '15px sans-serif', '#b9c4d8');
  centerText(ctx, 'WASD / arrows to move  •  R to restart  •  ENTER or CLICK to begin', 396, 'bold 16px sans-serif', '#f2ead8');
  centerText(ctx, 'If the alarm hits 100%, the gallery locks down and you are caught.', 428, '14px sans-serif', '#ff9a9a');
  ctx.textAlign = 'left';
}

export function drawCaught(ctx, state) {
  drawWorld(ctx, state);
  dimScreen(ctx);
  centerText(ctx, 'BUSTED!', 220, 'bold 56px Georgia, serif', '#ff5a5a');
  centerText(ctx, state.caughtReason, 268, '18px sans-serif', '#e8e4d8');
  centerText(ctx, `Loot kept: $${state.score.toLocaleString()}   •   Time in the gallery: ${Math.floor(state.elapsed)}s`, 306, '15px sans-serif', '#c8ccd8');
  centerText(ctx, 'The guards knew the floor better than you did. Study the cones, then try again.', 344, '15px sans-serif', '#b9c4d8');
  centerText(ctx, 'Press ENTER or CLICK to try again  •  R to restart', 400, 'bold 16px sans-serif', '#f2ead8');
  ctx.textAlign = 'left';
}

export function drawWin(ctx, state) {
  drawWorld(ctx, state);
  dimScreen(ctx);
  centerText(ctx, 'CLEAN GETAWAY!', 200, 'bold 54px Georgia, serif', '#37d67a');
  centerText(ctx, `You slipped out with the ${MAIN_LOOT_NAME}.`, 252, '19px sans-serif', '#e8e4d8');
  const minutes = Math.floor(state.elapsed / 60);
  const seconds = Math.floor(state.elapsed % 60).toString().padStart(2, '0');
  const timeBonus = Math.max(0, 600 - Math.floor(state.elapsed)) * 2;
  centerText(ctx, `Loot $${state.score.toLocaleString()}  +  time bonus $${timeBonus}  =  $${(state.score + timeBonus).toLocaleString()}`, 296, '17px sans-serif', '#f2d98c');
  centerText(ctx, `Finished in ${minutes}:${seconds} with the alarm at ${Math.floor(state.alarm)}%.`, 330, '15px sans-serif', '#c8ccd8');
  centerText(ctx, 'Press ENTER or CLICK to play again  •  R to restart', 392, 'bold 16px sans-serif', '#f2ead8');
  ctx.textAlign = 'left';
}

function drawMoveTarget(ctx, target, time) {
  if (!target) return;
  const pulse = 6 + Math.sin(time * 6) * 2;
  ctx.strokeStyle = 'rgba(242, 217, 140, 0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(target.x, target.y, pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(target.x - 9, target.y);
  ctx.lineTo(target.x + 9, target.y);
  ctx.moveTo(target.x, target.y - 9);
  ctx.lineTo(target.x, target.y + 9);
  ctx.stroke();
}

export function drawWorld(ctx, state) {
  drawFloor(ctx, state.time);
  drawShadowZones(ctx, state.shadowZones);
  drawExit(ctx, state.exit, state.exitArmed, state.time);
  drawLoot(ctx, state.loot, state.time);
  drawSmokePickups(ctx, state.smokePickups, state.time);
  drawSmokeClouds(ctx, state.smokeClouds);
  drawCameras(ctx, state.cameras);
  drawGuards(ctx, state.guards);
  drawPlayer(ctx, state.player, state.time);
  drawMoveTarget(ctx, state.moveTarget, state.time);
  drawWalls(ctx, state.walls);
  drawCover(ctx, state.cover);
  // Walls and cover are drawn last so the thief ducks behind them visually.
  drawGuardLabels(ctx, state.guards);
  drawHud(ctx, state);
}
