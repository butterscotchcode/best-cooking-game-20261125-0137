// Dapur Kilat — everything the player sees, drawn with canvas shapes only.
// Warm colours, thick outlines and big labels: the whole kitchen must read
// at a glance, even shrunk to a 768 px contact sheet.
import {
  CANVAS_HEIGHT, CANVAS_WIDTH, INGREDIENTS, LAYOUT, levelTuning,
  MAX_HEARTS, RECIPES,
} from './config.js';
import { SCREEN_DAY_OVER, SCREEN_GAME_OVER, SCREEN_PLAY, SCREEN_TITLE } from './world.js';

const WALL = '#7a4a2b';
const WALL_TOP = '#8d5a35';
const FLOOR_A = '#e8c39a';
const FLOOR_B = '#dfb586';
const COUNTER = '#b07a45';
const COUNTER_DARK = '#8d5c30';
const CREAM = '#fff8e7';
const INK = '#2b1a0e';
const RED = '#d62828';
const GREEN = '#2a9d3a';
const GOLD = '#ffb703';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight, align) {
  ctx.fillStyle = color || INK;
  ctx.font = (weight || '700') + ' ' + size + 'px Verdana, sans-serif';
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function pill(ctx, x, y, w, h, fill, stroke) {
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) { ctx.lineWidth = 2; ctx.strokeStyle = stroke; ctx.stroke(); }
}

/** One ingredient drawn big and bold: rice mound, noodles, egg, drumstick, chilli, greens, onion. */
export function drawFood(ctx, id, x, y, size, prepared) {
  ctx.save();
  ctx.translate(x, y);
  const s = size / 40;
  ctx.scale(s, s);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = 'rgba(43,26,14,0.55)';
  if (id === 'nasi') {
    ctx.fillStyle = prepared === 'burnt' ? '#3a2a1a' : '#fff3c4';
    ctx.beginPath(); ctx.ellipse(0, 4, 17, 11, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e8c85a';
    ctx.beginPath(); ctx.ellipse(-6, -2, 3, 2, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(5, -4, 3, 2, -0.3, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'mie') {
    ctx.strokeStyle = prepared === 'burnt' ? '#3a2a1a' : '#d99a26';
    ctx.lineWidth = 4;
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-14, i * 7);
      ctx.bezierCurveTo(-7, i * 7 - 6, 7, i * 7 + 6, 14, i * 7);
      ctx.stroke();
    }
  } else if (id === 'telur') {
    ctx.fillStyle = prepared === 'burnt' ? '#4a3520' : '#fffdf5';
    ctx.beginPath(); ctx.ellipse(0, 0, 18, 13, 0.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = prepared === 'burnt' ? '#2a1a08' : '#f2b705';
    ctx.beginPath(); ctx.arc(2, 0, 7, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'ayam') {
    ctx.fillStyle = prepared === 'burnt' ? '#2e1c0e' : '#c46a1b';
    ctx.beginPath(); ctx.arc(-4, -3, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = prepared === 'burnt' ? '#2e1c0e' : '#f6b26b';
    ctx.beginPath(); ctx.arc(-4, -3, 7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff8e7'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(6, 6); ctx.lineTo(15, 15); ctx.stroke();
    ctx.fillStyle = '#fff8e7';
    ctx.beginPath(); ctx.arc(17, 17, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(13, 19, 3, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'cabai') {
    ctx.fillStyle = prepared === 'burnt' ? '#3a2a1a' : '#ff5a4e';
    ctx.beginPath();
    ctx.moveTo(-14, -8);
    ctx.quadraticCurveTo(2, -16, 14, 2);
    ctx.quadraticCurveTo(16, 8, 10, 10);
    ctx.quadraticCurveTo(-2, 4, -14, -8);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#2f7d1e'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-14, -8); ctx.quadraticCurveTo(-18, -14, -12, -16); ctx.stroke();
  } else if (id === 'sayur') {
    ctx.fillStyle = prepared === 'burnt' ? '#3a2a1a' : '#7ed957';
    for (const [lx, ly, rot] of [[-8, 2, -0.5], [0, -6, 0], [8, 2, 0.5]]) {
      ctx.save(); ctx.translate(lx, ly); ctx.rotate(rot);
      ctx.beginPath(); ctx.ellipse(0, 0, 7, 11, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
  } else if (id === 'bawang') {
    ctx.fillStyle = prepared === 'burnt' ? '#3a2a1a' : '#e8b4f0';
    ctx.beginPath(); ctx.arc(0, 2, 13, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#8e44ad'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 2, 8, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 2, 3, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#7ed957'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, -17); ctx.stroke();
  }
  ctx.restore();
}

function drawProgressBar(ctx, x, y, w, h, ratio, fill) {
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = 'rgba(43,26,14,0.25)';
  ctx.fill();
  if (ratio > 0) {
    roundRect(ctx, x, y, Math.max(h, w * Math.min(1, ratio)), h, h / 2);
    ctx.fillStyle = fill;
    ctx.fill();
  }
  ctx.lineWidth = 2;
  ctx.strokeStyle = INK;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.stroke();
}

function drawTimerText(ctx, seconds, x, y, size) {
  const total = Math.max(0, Math.ceil(seconds));
  const mm = String(Math.floor(total / 60)).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  const urgent = seconds <= 10;
  text(ctx, mm + ':' + ss, x, y, size, urgent ? RED : INK, '800', 'center');
}

function drawOrderTicket(ctx, order, x, y, w, h) {
  const recipe = RECIPES[order.recipeId];
  const ratio = Math.max(0, order.secondsLeft / order.totalSeconds);
  const urgent = order.secondsLeft <= 12;
  roundRect(ctx, x, y, w, h, 12);
  ctx.fillStyle = urgent ? '#ffe1de' : CREAM;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = urgent ? RED : recipe.color;
  ctx.stroke();
  pill(ctx, x + 10, y + 8, 118, 22, recipe.color, null);
  text(ctx, recipe.name.toUpperCase(), x + 69, y + 20, 13, '#fff', '800', 'center');
  text(ctx, recipe.tagline, x + 136, y + 20, 12, '#6b4a2a', '600');
  // The exact items the dish needs, so the cook can read the recipe at a glance.
  order && recipe.items.forEach((id, i) => {
    drawFood(ctx, id, x + 34 + i * 62, y + 56, 40, id === 'ayam' || id === 'telur' || id === 'mie' ? 'cooked' : 'chopped');
    text(ctx, INGREDIENTS[id].name, x + 34 + i * 62, y + 82, 11, INK, '700', 'center');
  });
  drawProgressBar(ctx, x + w - 118, y + 44, 104, 12, ratio, urgent ? RED : GREEN);
  text(ctx, Math.ceil(order.secondsLeft) + ' dtk', x + w - 66, y + 66, 13, urgent ? RED : INK, '800', 'center');
  text(ctx, '+' + recipe.reward + ' koin', x + w - 66, y + 84, 11, '#6b4a2a', '700', 'center');
}

function drawHud(ctx, kitchen) {
  const hud = LAYOUT.hud;
  ctx.fillStyle = WALL_TOP;
  ctx.fillRect(hud.x, hud.y, hud.w, hud.h);
  ctx.fillStyle = WALL;
  ctx.fillRect(hud.x, hud.y + hud.h - 6, hud.w, 6);
  text(ctx, '🍳 DAPUR KILAT', 20, 32, 30, '#fff', '800');
  text(ctx, 'Level ' + kitchen.level, 300, 32, 20, '#ffd98a', '800');
  pill(ctx, 420, 14, 190, 34, '#fff8e7', null);
  text(ctx, '⭐ ' + kitchen.score + '  •  🪙 ' + kitchen.coins, 515, 32, 18, INK, '800', 'center');
  if (kitchen.combo >= 2) {
    pill(ctx, 626, 14, 110, 34, GOLD, null);
    text(ctx, 'COMBO x' + kitchen.combo, 681, 32, 16, INK, '800', 'center');
  }
  for (let i = 0; i < MAX_HEARTS; i += 1) {
    text(ctx, i < kitchen.hearts ? '❤️' : '🖤', 770 + i * 34, 33, 22, '#fff', '400', 'center');
  }
  pill(ctx, 880, 12, 180, 38, kitchen.shiftLeft <= 15 ? '#ff5a4e' : '#fff8e7', null);
  text(ctx, '⏱', 906, 32, 18, kitchen.shiftLeft <= 15 ? '#fff' : INK, '800', 'center');
  drawTimerText(ctx, kitchen.shiftLeft, 1000, 32, 22);
  text(ctx, 'Tangan: ' + (kitchen.hand ? INGREDIENTS[kitchen.hand.id].name + ' (' + kitchen.hand.prepared + ')' : 'kosong'), 1072, 32, 13, '#ffe9a8', '700');
}

function drawBins(ctx, kitchen) {
  const bins = LAYOUT.bins;
  const ids = Object.keys(INGREDIENTS);
  const w = bins.w / ids.length;
  ids.forEach((id, i) => {
    const x = bins.x + i * w;
    const hot = kitchen.hand && kitchen.hand.id === id;
    roundRect(ctx, x + 3, bins.y, w - 6, bins.h, 10);
    ctx.fillStyle = hot ? '#ffe9a8' : COUNTER;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = hot ? GOLD : COUNTER_DARK;
    ctx.stroke();
    drawFood(ctx, id, x + w / 2, bins.y + 38, 46, 'raw');
    text(ctx, INGREDIENTS[id].name, x + w / 2, bins.y + 74, 14, '#fff', '800', 'center');
    pill(ctx, x + w / 2 - 11, bins.y + 82, 22, 16, '#2b1a0e', null);
    text(ctx, INGREDIENTS[id].key, x + w / 2, bins.y + 91, 11, '#fff', '800', 'center');
  });
}

function drawBoard(ctx, kitchen) {
  const r = LAYOUT.board;
  roundRect(ctx, r.x, r.y, r.w, r.h, 10);
  ctx.fillStyle = '#d9a066';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = COUNTER_DARK;
  ctx.stroke();
  text(ctx, '🔪 TALENAN', r.x + r.w / 2, r.y + 14, 13, INK, '800', 'center');
  const slot = kitchen.stations.board;
  if (slot.busy && slot.item) {
    drawFood(ctx, slot.item.id, r.x + r.w / 2, r.y + 48, 44, 'chopped');
    const need = levelTuning(kitchen.level).chopSeconds;
    drawProgressBar(ctx, r.x + 12, r.y + 78, r.w - 24, 12, slot.progress / need, GREEN);
    text(ctx, slot.progress >= need ? 'SIAP! klik ambil' : 'memotong… (Space = cepat)', r.x + r.w / 2, r.y + 98, 10, INK, '700', 'center');
  } else {
    text(ctx, 'kosong — bawa bahan', r.x + r.w / 2, r.y + 48, 12, '#6b4a2a', '700', 'center');
    text(ctx, 'potong: cabai, sayur, bawang', r.x + r.w / 2, r.y + 70, 11, '#6b4a2a', '600', 'center');
  }
}

function drawStove(ctx, kitchen) {
  const r = LAYOUT.stove;
  roundRect(ctx, r.x, r.y, r.w, r.h, 10);
  ctx.fillStyle = '#3a3f4a';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#20242c';
  ctx.stroke();
  text(ctx, '🍳 WAJAN', r.x + r.w / 2, r.y + 14, 13, '#fff', '800', 'center');
  const slot = kitchen.stations.stove;
  // Burner flames under the wok.
  ctx.fillStyle = '#ff7b00';
  ctx.beginPath(); ctx.ellipse(r.x + r.w / 2 - 20, r.y + 88, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(r.x + r.w / 2 + 20, r.y + 88, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffd23f';
  ctx.beginPath(); ctx.ellipse(r.x + r.w / 2 - 20, r.y + 87, 9, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(r.x + r.w / 2 + 20, r.y + 87, 9, 3, 0, 0, Math.PI * 2); ctx.fill();
  // Wok bowl.
  ctx.fillStyle = '#22252c';
  ctx.beginPath(); ctx.ellipse(r.x + r.w / 2, r.y + 56, 52, 22, 0, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#4a4f5a';
  ctx.beginPath(); ctx.ellipse(r.x + r.w / 2, r.y + 56, 52, 10, 0, 0, Math.PI); ctx.fill();
  if (slot.busy && slot.item) {
    drawFood(ctx, slot.item.id, r.x + r.w / 2, r.y + 52, 40, slot.item.prepared === 'burnt' ? 'burnt' : 'cooked');
    const need = levelTuning(kitchen.level).cookSeconds;
    drawProgressBar(ctx, r.x + 12, r.y + 78, r.w - 24, 12, slot.progress / need, slot.item.prepared === 'burnt' ? RED : '#ff7b00');
    text(ctx, slot.item.prepared === 'burnt' ? 'GOSONG! klik buang (T)' : (slot.progress >= need ? 'MATANG! klik ambil' : 'memasak…'), r.x + r.w / 2, r.y + 98, 10, slot.item.prepared === 'burnt' ? '#ff5a4e' : '#fff', '800', 'center');
  } else {
    text(ctx, 'kosong — bawa bahan', r.x + r.w / 2, r.y + 52, 12, '#cfd3da', '700', 'center');
    text(ctx, 'masak: mie, telur, ayam', r.x + r.w / 2, r.y + 70, 11, '#cfd3da', '600', 'center');
  }
}

function drawServe(ctx, kitchen) {
  const r = LAYOUT.serve;
  const flashing = kitchen.servedFlash > 0 && kitchen.elapsed < kitchen.servedFlash;
  roundRect(ctx, r.x, r.y, r.w, r.h, 10);
  ctx.fillStyle = flashing ? '#ffe9a8' : '#2f6f4f';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#1d4d33';
  ctx.stroke();
  const main = flashing ? INK : '#fff';
  const sub = flashing ? '#5a4632' : '#d8f3dc';
  const faint = flashing ? '#7a6a55' : '#b7e4c7';
  text(ctx, '🛎️ MEJA SAJI — klik antar (S)', r.x + r.w / 2, r.y + 14, 13, main, '800', 'center');
  const match = kitchen.orders.find((o) => kitchen.plate.length > 0
    && kitchen.plate.length === RECIPES[o.recipeId].items.length
    && kitchen.plate.map((i) => i.id).sort().join() === [...RECIPES[o.recipeId].items].sort().join());
  if (match) {
    text(ctx, '✓ ' + RECIPES[match.recipeId].name.toUpperCase() + ' SIAP!', r.x + r.w / 2, r.y + 44, 17, main, '800', 'center');
    text(ctx, 'piring lengkap — klik antar', r.x + r.w / 2, r.y + 68, 13, sub, '700', 'center');
    text(ctx, 'hadiah +' + RECIPES[match.recipeId].reward + ' koin', r.x + r.w / 2, r.y + 88, 13, GOLD, '800', 'center');
  } else if (kitchen.plate.length > 0) {
    text(ctx, 'Piring dirakit: ' + kitchen.plate.length + '/3 bahan', r.x + r.w / 2, r.y + 44, 14, main, '800', 'center');
    text(ctx, 'belum cocok — cek resep', r.x + r.w / 2, r.y + 68, 13, sub, '700', 'center');
    text(ctx, 'di order board ↑', r.x + r.w / 2, r.y + 88, 13, faint, '600', 'center');
  } else {
    text(ctx, 'belum ada piring siap saji', r.x + r.w / 2, r.y + 56, 13, sub, '700', 'center');
    text(ctx, 'rakit hidangan di piring dulu', r.x + r.w / 2, r.y + 76, 12, faint, '600', 'center');
  }
}

function drawPlateCounter(ctx, kitchen) {
  const r = LAYOUT.plate;
  roundRect(ctx, r.x, r.y, r.w, r.h, 10);
  ctx.fillStyle = COUNTER;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = COUNTER_DARK;
  ctx.stroke();
  text(ctx, '🍽️ PIRING — klik untuk menaruh bahan olahan', r.x + 16, r.y + 16, 13, '#fff', '800');
  // The plate itself, big and white, with the dish assembling on it.
  ctx.fillStyle = '#fffdf5';
  ctx.beginPath(); ctx.ellipse(r.x + 95, r.y + 68, 70, 30, 0, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = '#d9c9a8'; ctx.stroke();
  ctx.fillStyle = '#f3e9d2';
  ctx.beginPath(); ctx.ellipse(r.x + 95, r.y + 68, 50, 19, 0, 0, Math.PI * 2); ctx.fill();
  if (kitchen.plate.length === 0) {
    text(ctx, 'piring kosong', r.x + 95, r.y + 68, 12, '#8a7a5f', '700', 'center');
  } else {
    kitchen.plate.forEach((item, i) => {
      drawFood(ctx, item.id, r.x + 55 + i * 42, r.y + 62, 38, item.prepared);
    });
  }
  const match = kitchen.orders.find((o) => kitchen.plate.length > 0 && kitchen.plate.length === RECIPES[o.recipeId].items.length
    && kitchen.plate.map((i) => i.id).sort().join() === [...RECIPES[o.recipeId].items].sort().join());
  if (match) {
    pill(ctx, r.x + 205, r.y + 44, 132, 30, GREEN, null);
    text(ctx, '✓ ' + RECIPES[match.recipeId].name, r.x + 271, r.y + 60, 13, '#fff', '800', 'center');
    text(ctx, 'siap diantar! (S)', r.x + 271, r.y + 82, 12, '#fff', '700', 'center');
  } else if (kitchen.plate.length > 0) {
    text(ctx, kitchen.plate.length + '/3 bahan', r.x + 271, r.y + 52, 14, '#fff', '800', 'center');
    text(ctx, 'cek resep di atas ↑', r.x + 271, r.y + 74, 12, '#ffe9a8', '700', 'center');
  } else {
    text(ctx, 'Resep di order board ↑', r.x + 271, r.y + 60, 12, '#ffe9a8', '700', 'center');
  }
}

function drawTrash(ctx) {
  const r = LAYOUT.trash;
  roundRect(ctx, r.x, r.y, r.w, r.h, 10);
  ctx.fillStyle = '#5a5f6a';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#3a3e46';
  ctx.stroke();
  text(ctx, '🗑️ SAMPAH (T)', r.x + r.w / 2, r.y + 18, 13, '#fff', '800', 'center');
  text(ctx, 'buang bahan / piring', r.x + r.w / 2, r.y + 44, 12, '#d5d8de', '600', 'center');
  text(ctx, 'atau masakan gosong', r.x + r.w / 2, r.y + 64, 12, '#d5d8de', '600', 'center');
}

function drawChef(ctx, kitchen) {
  const chef = kitchen.chef;
  const bob = chef.walking ? Math.sin(kitchen.elapsed * 14) * 3 : 0;
  const chop = chef.chopAnim > 0 ? Math.sin(kitchen.elapsed * 30) * 6 : 0;
  ctx.save();
  ctx.translate(chef.x, chef.y + bob);
  // Shadow.
  ctx.fillStyle = 'rgba(43,26,14,0.25)';
  ctx.beginPath(); ctx.ellipse(0, 26 - bob, 26, 8, 0, 0, Math.PI * 2); ctx.fill();
  // Body: white apron, red neckerchief.
  ctx.fillStyle = '#fffdf5';
  roundRect(ctx, -20, -6, 40, 34, 12);
  ctx.fill();
  ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = RED;
  ctx.beginPath(); ctx.moveTo(-8, -4); ctx.lineTo(8, -4); ctx.lineTo(0, 6); ctx.closePath(); ctx.fill();
  // Head + chef hat.
  ctx.fillStyle = '#ffd9b3';
  ctx.beginPath(); ctx.arc(0, -20, 15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#fffdf5';
  ctx.beginPath(); ctx.arc(-8, -32, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -36, 9, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(8, -32, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-14, -34, 28, 8);
  // Eyes look the way he walks.
  ctx.fillStyle = INK;
  ctx.beginPath(); ctx.arc(chef.facing * 3 - 5, -21, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(chef.facing * 3 + 5, -21, 2, 0, Math.PI * 2); ctx.fill();
  // Arm + the item in hand, held up high so it is always visible.
  ctx.strokeStyle = INK; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(chef.facing * 16, 4); ctx.lineTo(chef.facing * 26, -14 + chop); ctx.stroke();
  if (kitchen.hand) {
    drawFood(ctx, kitchen.hand.id, chef.facing * 28, -26 + chop, 34, kitchen.hand.prepared);
  }
  ctx.restore();
}

function drawToast(ctx, kitchen) {
  if (!kitchen.toast || kitchen.elapsed > kitchen.toastUntil) return;
  const w = 560;
  pill(ctx, (CANVAS_WIDTH - w) / 2, CANVAS_HEIGHT - 52, w, 34, 'rgba(43,26,14,0.88)', null);
  text(ctx, kitchen.toast, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 34, 15, '#fff8e7', '700', 'center');
}

function drawOrders(ctx, kitchen) {
  const board = LAYOUT.orders;
  text(ctx, '📋 ORDER BOARD — sajikan sebelum timer habis!', board.x, board.y - 10, 14, '#fff8e7', '800');
  text(ctx, 'COUNTER BAHAN di bawah: klik / tombol 1-7', board.x + board.w, board.y - 10, 12, '#ffd98a', '700', 'right');
  const w = (board.w - 24) / MAX_HEARTS;
  for (let i = 0; i < MAX_HEARTS; i += 1) {
    const order = kitchen.orders[i];
    const x = board.x + i * (w + 12);
    if (order) drawOrderTicket(ctx, order, x, board.y, w, board.h);
    else {
      roundRect(ctx, x, board.y, w, board.h, 12);
      ctx.fillStyle = 'rgba(255,248,231,0.18)';
      ctx.fill();
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,248,231,0.6)'; ctx.stroke();
      ctx.setLineDash([]);
      text(ctx, 'menunggu pesanan…', x + w / 2, board.y + board.h / 2, 14, 'rgba(255,248,231,0.8)', '700', 'center');
    }
  }
}

function drawFloor(ctx) {
  const floor = LAYOUT.floor;
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      ctx.fillStyle = (row + col) % 2 === 0 ? FLOOR_A : FLOOR_B;
      ctx.fillRect(floor.x + col * 160, floor.y + row * 71, 160, 71);
    }
  }
  ctx.fillStyle = 'rgba(43,26,14,0.15)';
  ctx.fillRect(0, LAYOUT.floor.y - 4, CANVAS_WIDTH, 4);
}

function drawOverlay(ctx, title, lines, hint, accent) {
  ctx.fillStyle = 'rgba(20,10,4,0.72)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  roundRect(ctx, 290, 150, 700, 380, 18);
  ctx.fillStyle = CREAM;
  ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = accent; ctx.stroke();
  text(ctx, title, CANVAS_WIDTH / 2, 210, 40, INK, '800', 'center');
  lines.forEach((line, i) => {
    text(ctx, line, CANVAS_WIDTH / 2, 270 + i * 34, 18, '#5a4632', '600', 'center');
  });
  text(ctx, hint, CANVAS_WIDTH / 2, 480, 18, accent, '800', 'center');
}

/** Draw one frame of the whole game. */
export function drawKitchen(ctx, kitchen) {
  ctx.fillStyle = WALL;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = WALL_TOP;
  ctx.fillRect(0, 0, CANVAS_WIDTH, 62);
  drawFloor(ctx);
  drawHud(ctx, kitchen);
  drawOrders(ctx, kitchen);
  drawBins(ctx, kitchen);
  drawBoard(ctx, kitchen);
  drawStove(ctx, kitchen);
  drawServe(ctx, kitchen);
  drawPlateCounter(ctx, kitchen);
  drawTrash(ctx);
  drawChef(ctx, kitchen);
  drawToast(ctx, kitchen);
  if (kitchen.screen === SCREEN_TITLE) {
    drawOverlay(ctx, '🍳 DAPUR KILAT', [
      'Kamu koki di dapur tersibuk kota. Pesanan datang terus —',
      'ambil bahan, potong di talenan, masak di wajan, rakit di piring,',
      'antar ke meja saji sebelum timer pesanan habis!',
      '',
      'Klik / tombol 1-7: ambil bahan   •   Space: potong cepat / taruh piring',
      'S: antar pesanan   •   T: buang   •   Jangan sampai gosong!',
    ], 'KLIK UNTUK MULAI MEMASAK', GOLD);
  } else if (kitchen.screen === SCREEN_DAY_OVER) {
    drawOverlay(ctx, '🎉 SHIFT SELESAI!', [
      'Skor: ' + kitchen.score + '  •  Pesanan tersaji: ' + kitchen.servedCount,
      'Combo terbaik: x' + kitchen.bestCombo + '  •  Pesanan hangus: ' + kitchen.lostCount,
      'Level berikutnya: ' + (kitchen.level + 1) + ' — pesanan datang lebih cepat!',
    ], 'KLIK UNTUK LANJUT KE SHIFT BERIKUTNYA', GREEN);
  } else if (kitchen.screen === SCREEN_GAME_OVER) {
    drawOverlay(ctx, '💔 DAPUR TUTUP', [
      'Tiga pesanan hangus — pelanggan pulang kecewa.',
      'Skor akhir: ' + kitchen.score + '  •  Tersaji: ' + kitchen.servedCount + ' hidangan',
      'Combo terbaik: x' + kitchen.bestCombo,
    ], 'KLIK UNTUK MASAK LAGI', RED);
  }
  if (kitchen.screen === SCREEN_PLAY && kitchen.lostFlash > 0 && kitchen.elapsed < kitchen.lostFlash) {
    ctx.fillStyle = 'rgba(214,40,40,0.18)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
}
