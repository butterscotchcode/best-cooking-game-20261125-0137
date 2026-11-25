// Dapur Kilat — the kitchen state and its rules. No drawing here, no DOM:
// a pure state machine the renderer reads and the input layer drives, so
// the screenshot stager can run the same rules forward deterministically.
import {
  CANVAS_WIDTH, CHEF_SPEED, CHOP_MASH_BONUS, COMBO_STEP, HAND_CAPACITY, INGREDIENTS,
  LAYOUT, levelTuning, MAX_HEARTS, MAX_OPEN_ORDERS, PLATE_CAPACITY,
  RECIPE_ORDER, RECIPES, SHIFT_SECONDS,
} from './config.js';
import { makeRng, pickFrom } from './random.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_DAY_OVER = 'day-over';
export const SCREEN_GAME_OVER = 'game-over';

export const EVENT_SERVED = 1;
export const EVENT_ORDER_LOST = 2;
export const EVENT_DAY_OVER = 4;
export const EVENT_GAME_OVER = 8;

export const STATION_BIN = 'bin';
export const STATION_BOARD = 'board';
export const STATION_STOVE = 'stove';
export const STATION_PLATE = 'plate';
export const STATION_SERVE = 'serve';
export const STATION_TRASH = 'trash';

/** A carried or plated item: which ingredient, and how it was prepared. */
export function makeFoodItem(ingredientId, prepared) {
  return { id: ingredientId, prepared: prepared || 'raw' };
}

/** One order ticket: a recipe, its own countdown, and its reward. */
export function makeOrder(id, recipeId, secondsLeft) {
  return { id, recipeId, secondsLeft, totalSeconds: secondsLeft, served: false };
}

function emptyStations() {
  return {
    board: { item: null, progress: 0, busy: false },
    stove: { item: null, progress: 0, busy: false, burn: 0 },
  };
}

/** Fresh kitchen: empty counters, one first order, chef at home. */
export function createKitchen(seed) {
  const rng = makeRng(seed || 20261125);
  const kitchen = {
    rng,
    seed: seed || 20261125,
    screen: SCREEN_TITLE,
    level: 1,
    score: 0,
    coins: 0,
    combo: 0,
    bestCombo: 0,
    hearts: MAX_HEARTS,
    shiftLeft: SHIFT_SECONDS,
    orders: [],
    nextOrderId: 1,
    spawnIn: 6,
    hand: null,
    plate: [],
    stations: emptyStations(),
    chef: { x: LAYOUT.chefHome.x, y: LAYOUT.chefHome.y, tx: LAYOUT.chefHome.x, ty: LAYOUT.chefHome.y, facing: 1, walking: false, chopAnim: 0 },
    toast: '',
    toastUntil: 0,
    servedFlash: 0,
    lostFlash: 0,
    elapsed: 0,
    servedCount: 0,
    lostCount: 0,
  };
  spawnOrder(kitchen);
  return kitchen;
}

/** Put the kitchen back to a fresh day, keeping the same seed. */
export function resetKitchen(kitchen) {
  const fresh = createKitchen(kitchen.seed);
  Object.keys(fresh).forEach((key) => { kitchen[key] = fresh[key]; });
  kitchen.screen = SCREEN_PLAY;
}

/** Open a new order ticket when the board has room. */
export function spawnOrder(kitchen, forcedRecipeId) {
  if (kitchen.orders.length >= MAX_OPEN_ORDERS) return null;
  const tuning = levelTuning(kitchen.level);
  const recipeId = forcedRecipeId || pickFrom(kitchen.rng, RECIPE_ORDER);
  const order = makeOrder(kitchen.nextOrderId, recipeId, tuning.orderSeconds);
  kitchen.nextOrderId += 1;
  kitchen.orders.push(order);
  return order;
}

/** What the hand holds, as a short label for the HUD. */
export function handLabel(kitchen) {
  if (!kitchen.hand) return 'tangan kosong';
  const def = INGREDIENTS[kitchen.hand.id];
  if (kitchen.hand.prepared === 'raw') return def.name + ' mentah';
  if (kitchen.hand.prepared === 'ready') return def.name + ' siap saji';
  if (kitchen.hand.prepared === 'chopped') return def.name + ' cincang';
  return def.name + ' matang';
}

function stationCentre(rect) {
  return { x: rect.x + rect.w / 2, y: rect.y + rect.h + 26 };
}

/** Send the chef walking toward a station; the action itself runs at once. */
function walkChefTo(kitchen, rect) {
  const spot = stationCentre(rect);
  kitchen.chef.tx = Math.max(40, Math.min(CANVAS_WIDTH - 40, spot.x));
  kitchen.chef.ty = Math.max(LAYOUT.floor.y + 30, Math.min(700, spot.y));
}

function setToast(kitchen, text) {
  kitchen.toast = text;
  kitchen.toastUntil = kitchen.elapsed + 2.2;
}

/** Pick a raw ingredient off its bin into the hand. */
export function pickIngredient(kitchen, ingredientId) {
  if (kitchen.screen !== SCREEN_PLAY) return false;
  if (kitchen.hand) { setToast(kitchen, 'Tangan penuh — olah dulu bahannya!'); return false; }
  if (!INGREDIENTS[ingredientId]) return false;
  // A 'ready' ingredient (nasi) needs no prep: it is already plateable.
  kitchen.hand = makeFoodItem(ingredientId, INGREDIENTS[ingredientId].prep === 'ready' ? 'ready' : 'raw');
  walkChefTo(kitchen, binRect(ingredientId));
  return true;
}

function binRect(ingredientId) {
  const ids = Object.keys(INGREDIENTS);
  const index = ids.indexOf(ingredientId);
  const bins = LAYOUT.bins;
  const w = bins.w / ids.length;
  return { x: bins.x + index * w, y: bins.y, w, h: bins.h };
}

/**
 * Put the carried item onto the cutting board (chop) or the wok (cook).
 * A station already working refuses, and the wrong prep refuses with a hint.
 */
export function startPrep(kitchen, station) {
  if (kitchen.screen !== SCREEN_PLAY) return false;
  if (!kitchen.hand) { setToast(kitchen, 'Ambil bahan dulu dari counter!'); return false; }
  const def = INGREDIENTS[kitchen.hand.id];
  const slot = kitchen.stations[station];
  if (!slot) return false;
  if (slot.busy) { setToast(kitchen, station === 'board' ? 'Talenan lagi dipakai!' : 'Wajan lagi dipakai!'); return false; }
  if (station === 'board' && def.prep !== 'chop') {
    setToast(kitchen, def.name + ' tidak perlu dipotong — ' + def.blurb + '.');
    return false;
  }
  if (station === 'stove' && def.prep !== 'cook') {
    setToast(kitchen, def.name + ' tidak perlu dimasak — ' + def.blurb + '.');
    return false;
  }
  if (kitchen.hand.prepared !== 'raw') { setToast(kitchen, def.name + ' sudah siap, langsung ke piring!'); return false; }
  slot.item = kitchen.hand;
  slot.progress = 0;
  slot.burn = 0;
  slot.busy = true;
  kitchen.hand = null;
  walkChefTo(kitchen, station === 'board' ? LAYOUT.board : LAYOUT.stove);
  kitchen.chef.chopAnim = 0.4;
  return true;
}

/** Take a finished item off a station back into the hand. */
export function collectPrep(kitchen, station) {
  if (kitchen.screen !== SCREEN_PLAY) return false;
  const slot = kitchen.stations[station];
  if (!slot || !slot.busy) return false;
  const tuning = levelTuning(kitchen.level);
  const need = station === 'board' ? tuning.chopSeconds : tuning.cookSeconds;
  if (slot.progress < need) { setToast(kitchen, 'Belum selesai — tunggu bar penuh!'); return false; }
  if (kitchen.hand) { setToast(kitchen, 'Tangan penuh — kosongkan dulu!'); return false; }
  kitchen.hand = slot.item;
  kitchen.hand.prepared = station === 'board' ? 'chopped' : 'cooked';
  kitchen.stations[station] = { item: null, progress: 0, busy: false, burn: 0 };
  walkChefTo(kitchen, station === 'board' ? LAYOUT.board : LAYOUT.stove);
  return true;
}

/** Lay the carried prepared item onto the plating counter's plate. */
export function addToPlate(kitchen) {
  if (kitchen.screen !== SCREEN_PLAY) return false;
  if (!kitchen.hand) { setToast(kitchen, 'Tidak ada yang bisa ditaruh di piring!'); return false; }
  if (kitchen.hand.prepared === 'raw') {
    const def = INGREDIENTS[kitchen.hand.id];
    setToast(kitchen, def.name + ' mentah — ' + def.blurb + ' dulu!');
    return false;
  }
  if (kitchen.plate.length >= PLATE_CAPACITY) { setToast(kitchen, 'Piring penuh (3 bahan)!'); return false; }
  kitchen.plate.push(kitchen.hand);
  kitchen.hand = null;
  walkChefTo(kitchen, LAYOUT.plate);
  return true;
}

/** Does the plate hold exactly the recipe's items, in any order? */
export function plateMatchesRecipe(plate, recipeId) {
  const want = [...RECIPES[recipeId].items].sort();
  const have = plate.map((item) => item.id).sort();
  if (want.length !== have.length) return false;
  return want.every((id, index) => id === have[index]);
}

/** Serve the plate at the window when it matches an open order. */
export function servePlate(kitchen) {
  if (kitchen.screen !== SCREEN_PLAY) return false;
  if (kitchen.plate.length === 0) { setToast(kitchen, 'Piring masih kosong!'); return false; }
  const match = kitchen.orders.find((order) => plateMatchesRecipe(kitchen.plate, order.recipeId));
  if (!match) {
    setToast(kitchen, 'Tidak ada pesanan yang cocok — cek order board!');
    return false;
  }
  const recipe = RECIPES[match.recipeId];
  const timeBonus = Math.round((match.secondsLeft / match.totalSeconds) * 40);
  const earned = Math.round((recipe.reward + timeBonus) * (1 + kitchen.combo * COMBO_STEP));
  kitchen.score += earned;
  kitchen.coins += earned;
  kitchen.combo += 1;
  kitchen.bestCombo = Math.max(kitchen.bestCombo, kitchen.combo);
  kitchen.servedCount += 1;
  kitchen.servedFlash = kitchen.elapsed + 0.9;
  kitchen.orders = kitchen.orders.filter((order) => order !== match);
  kitchen.plate = [];
  walkChefTo(kitchen, LAYOUT.serve);
  setToast(kitchen, recipe.name + ' disajikan! +' + earned + ' koin');
  if (kitchen.servedCount > 0 && kitchen.servedCount % 4 === 0) {
    kitchen.level += 1;
    setToast(kitchen, 'LEVEL ' + kitchen.level + ' — pesanan makin cepat!');
  }
  return true;
}

/** Throw away the hand item, the plate, or a burnt station item. */
export function trashHeld(kitchen) {
  if (kitchen.screen !== SCREEN_PLAY) return false;
  if (kitchen.hand) { kitchen.hand = null; }
  else if (kitchen.plate.length > 0) { kitchen.plate = []; }
  else {
    const stove = kitchen.stations.stove;
    if (stove.busy && stove.item) kitchen.stations.stove = { item: null, progress: 0, busy: false, burn: 0 };
    else return false;
  }
  walkChefTo(kitchen, LAYOUT.trash);
  setToast(kitchen, 'Dibuang ke tempat sampah.');
  return true;
}

/** Space mashes the chop: each press shaves time off the board. */
export function mashChop(kitchen) {
  const board = kitchen.stations.board;
  if (kitchen.screen === SCREEN_PLAY && board.busy && board.item) {
    board.progress += CHOP_MASH_BONUS;
    kitchen.chef.chopAnim = 0.25;
    return true;
  }
  return false;
}

/** One simulation tick: chef walk, station progress, order timers, spawns. */
export function stepKitchen(kitchen, dt, auto) {
  if (kitchen.screen !== SCREEN_PLAY) return 0;
  let events = 0;
  kitchen.elapsed += dt;
  kitchen.shiftLeft -= dt;
  if (kitchen.servedFlash > 0 && kitchen.elapsed > kitchen.servedFlash) kitchen.servedFlash = 0;
  if (kitchen.lostFlash > 0 && kitchen.elapsed > kitchen.lostFlash) kitchen.lostFlash = 0;

  // Chef walks toward the target spot, facing the way he moves.
  const chef = kitchen.chef;
  const dx = chef.tx - chef.x;
  const dy = chef.ty - chef.y;
  const dist = Math.hypot(dx, dy);
  if (dist > 4) {
    const step = Math.min(dist, CHEF_SPEED * dt);
    chef.x += (dx / dist) * step;
    chef.y += (dy / dist) * step;
    chef.facing = dx === 0 ? chef.facing : (dx > 0 ? 1 : -1);
    chef.walking = true;
  } else {
    chef.walking = false;
  }
  if (chef.chopAnim > 0) chef.chopAnim -= dt;

  // Stations cook/chop; a cooked item left too long burns.
  const tuning = levelTuning(kitchen.level);
  const board = kitchen.stations.board;
  if (board.busy && board.item) board.progress = Math.min(tuning.chopSeconds, board.progress + dt);
  const stove = kitchen.stations.stove;
  if (stove.busy && stove.item) {
    stove.progress = Math.min(tuning.cookSeconds, stove.progress + dt);
    if (stove.progress >= tuning.cookSeconds) {
      stove.burn += dt;
      if (stove.burn > tuning.burnGraceSeconds) {
        stove.item.prepared = 'burnt';
        setToast(kitchen, 'GOSONG! Buang dan masak lagi.');
      }
    }
  }

  // Order countdowns; an expired ticket costs a heart and the combo.
  for (const order of [...kitchen.orders]) {
    order.secondsLeft -= dt;
    if (order.secondsLeft <= 0) {
      kitchen.orders = kitchen.orders.filter((o) => o !== order);
      kitchen.hearts -= 1;
      kitchen.combo = 0;
      kitchen.lostCount += 1;
      kitchen.lostFlash = kitchen.elapsed + 0.9;
      setToast(kitchen, 'Pesanan ' + RECIPES[order.recipeId].name + ' hangus! -1 hati');
      events |= EVENT_ORDER_LOST;
      if (kitchen.hearts <= 0) {
        kitchen.screen = SCREEN_GAME_OVER;
        events |= EVENT_GAME_OVER;
        return events;
      }
    }
  }

  // New tickets arrive on a timer while the board has room.
  kitchen.spawnIn -= dt;
  if (kitchen.spawnIn <= 0) {
    spawnOrder(kitchen);
    kitchen.spawnIn = tuning.spawnEverySeconds;
  }

  // The shift ends: day over, score kept, level kept for the next day.
  if (kitchen.shiftLeft <= 0) {
    kitchen.shiftLeft = 0;
    kitchen.screen = SCREEN_DAY_OVER;
    events |= EVENT_DAY_OVER;
  }
  return events;
}

/** Start a fresh day after the day-over screen. */
export function nextDay(kitchen) {
  kitchen.screen = SCREEN_PLAY;
  kitchen.shiftLeft = SHIFT_SECONDS;
  kitchen.hearts = MAX_HEARTS;
  kitchen.orders = [];
  kitchen.nextOrderId = 1;
  kitchen.spawnIn = 4;
  kitchen.plate = [];
  kitchen.hand = null;
  kitchen.stations = emptyStations();
  spawnOrder(kitchen);
}
