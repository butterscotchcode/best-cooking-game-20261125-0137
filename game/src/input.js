// Dapur Kilat — mouse + keyboard. Clicks land on a station and run that
// station's action at once; the chef walks over while it happens, so the
// game feels instant even though the cook is on foot.
import { INGREDIENTS, LAYOUT } from './config.js';
import {
  addToPlate, collectPrep, mashChop, pickIngredient, servePlate, startPrep,
  trashHeld, STATION_BOARD, STATION_PLATE, STATION_SERVE, STATION_STOVE,
  STATION_TRASH,
} from './world.js';

function inside(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

function binAt(x, y) {
  const ids = Object.keys(INGREDIENTS);
  const bins = LAYOUT.bins;
  if (!inside(x, y, bins)) return null;
  const index = Math.floor((x - bins.x) / (bins.w / ids.length));
  return ids[Math.max(0, Math.min(ids.length - 1, index))];
}

/**
 * Route one click: ingredient bin, board, wok, plate, serving window or
 * trash. Clicking a busy station collects its finished item instead.
 */
export function handleClick(kitchen, x, y) {
  const bin = binAt(x, y);
  if (bin) return pickIngredient(kitchen, bin);
  if (inside(x, y, LAYOUT.board)) {
    if (kitchen.stations.board.busy) return collectPrep(kitchen, STATION_BOARD);
    return startPrep(kitchen, STATION_BOARD);
  }
  if (inside(x, y, LAYOUT.stove)) {
    if (kitchen.stations.stove.busy) return collectPrep(kitchen, STATION_STOVE);
    return startPrep(kitchen, STATION_STOVE);
  }
  if (inside(x, y, LAYOUT.plate)) return addToPlate(kitchen);
  if (inside(x, y, LAYOUT.serve)) return servePlate(kitchen);
  if (inside(x, y, LAYOUT.trash)) return trashHeld(kitchen);
  // Anywhere else on the floor: just walk the chef there.
  if (y > LAYOUT.floor.y) {
    kitchen.chef.tx = x;
    kitchen.chef.ty = y;
    return true;
  }
  return false;
}

/** Number keys pick ingredients, Space mashes the chop, S serves, T trashes. */
export function handleKey(kitchen, key) {
  const lower = key.toLowerCase();
  if (lower === ' ') {
    if (mashChop(kitchen)) return true;
    return addToPlate(kitchen);
  }
  if (lower === 's' || lower === 'enter') return servePlate(kitchen);
  if (lower === 't') return trashHeld(kitchen);
  const entry = Object.entries(INGREDIENTS).find(([, def]) => def.key === key);
  if (entry) return pickIngredient(kitchen, entry[0]);
  return false;
}

/** Canvas pixels back into game coordinates (the canvas is letterboxed). */
export function canvasPoint(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
}
