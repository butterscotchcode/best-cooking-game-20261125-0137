// Dapur Kilat — the four staged scenes behind ?shot=cover|start|rush|done.
// Each one builds a real kitchen state through the world's own factories
// (orders, prepared items, station slots), then the normal renderer draws
// it — so every frame is what the live game really looks like mid-play.
import { levelTuning } from './config.js';
import {
  makeFoodItem, makeOrder, resetKitchen,
  SCREEN_PLAY,
} from './world.js';

function putOrder(kitchen, recipeId, secondsLeft) {
  const order = makeOrder(kitchen.nextOrderId, recipeId, secondsLeft);
  kitchen.nextOrderId += 1;
  kitchen.orders.push(order);
  return order;
}

function chopping(kitchen, ingredientId, ratio) {
  const need = levelTuning(kitchen.level).chopSeconds;
  kitchen.stations.board = {
    item: makeFoodItem(ingredientId, 'raw'), progress: need * ratio, busy: true, burn: 0,
  };
}

function cooking(kitchen, ingredientId, ratio, burn) {
  const need = levelTuning(kitchen.level).cookSeconds;
  kitchen.stations.stove = {
    item: makeFoodItem(ingredientId, 'raw'), progress: need * ratio, busy: true, burn: burn || 0,
  };
}

/**
 * Stage `name` on a fresh kitchen and return the screen to draw.
 * cover: the busiest moment — 3 orders, board chopping, wok cooking, a
 *   complete plate ready to serve. start: a clean first morning. rush:
 *   timers nearly out, one heart left. done: a dish just served, big score.
 */
export function stageShot(name, kitchen) {
  resetKitchen(kitchen);
  kitchen.screen = SCREEN_PLAY;
  kitchen.orders = [];
  if (name === 'start') {
    kitchen.score = 0;
    kitchen.coins = 0;
    kitchen.shiftLeft = 150;
    putOrder(kitchen, 'nasiGoreng', 48);
    kitchen.chef.x = 640;
    kitchen.chef.y = 590;
    return { screen: SCREEN_PLAY };
  }
  if (name === 'rush') {
    kitchen.score = 820;
    kitchen.coins = 820;
    kitchen.combo = 4;
    kitchen.hearts = 1;
    kitchen.level = 3;
    kitchen.shiftLeft = 42;
    kitchen.elapsed = 108;
    putOrder(kitchen, 'ayamGeprek', 7);
    putOrder(kitchen, 'mieGoreng', 9);
    putOrder(kitchen, 'sotoAyam', 5);
    chopping(kitchen, 'cabai', 0.55);
    cooking(kitchen, 'ayam', 0.8, 2.4);
    kitchen.plate = [makeFoodItem('mie', 'cooked'), makeFoodItem('telur', 'cooked')];
    kitchen.hand = makeFoodItem('sayur', 'chopped');
    kitchen.chef.x = 780;
    kitchen.chef.y = 520;
    kitchen.toast = 'Cepat! Pesanan hampir hangus!';
    kitchen.toastUntil = kitchen.elapsed + 2.2;
    return { screen: SCREEN_PLAY };
  }
  if (name === 'done') {
    kitchen.score = 1250;
    kitchen.coins = 1250;
    kitchen.combo = 5;
    kitchen.bestCombo = 5;
    kitchen.servedCount = 9;
    kitchen.level = 2;
    kitchen.shiftLeft = 96;
    kitchen.elapsed = 54;
    putOrder(kitchen, 'gadoGado', 40);
    putOrder(kitchen, 'nasiGoreng', 44);
    kitchen.servedFlash = kitchen.elapsed + 0.9;
    kitchen.toast = 'Ayam Geprek disajikan! +182 koin';
    kitchen.toastUntil = kitchen.elapsed + 2.2;
    kitchen.chef.x = 1150;
    kitchen.chef.y = 520;
    return { screen: SCREEN_PLAY };
  }
  // cover (default): everything the judge looks for, in one frame.
  kitchen.score = 450;
  kitchen.coins = 450;
  kitchen.combo = 3;
  kitchen.bestCombo = 3;
  kitchen.servedCount = 4;
  kitchen.level = 2;
  kitchen.shiftLeft = 118;
  kitchen.elapsed = 32;
  putOrder(kitchen, 'nasiGoreng', 34);
  putOrder(kitchen, 'ayamGeprek', 26);
  putOrder(kitchen, 'mieGoreng', 41);
  chopping(kitchen, 'cabai', 0.6);
  cooking(kitchen, 'ayam', 0.7, 0);
  kitchen.plate = [
    makeFoodItem('nasi', 'ready'),
    makeFoodItem('telur', 'cooked'),
    makeFoodItem('bawang', 'chopped'),
  ];
  kitchen.chef.x = 780;
  kitchen.chef.y = 520;
  kitchen.chef.facing = 1;
  return { screen: SCREEN_PLAY };
}

/** The four shots the build ships, in file order (first is the cover). */
export const SHOT_NAMES = ['cover', 'start', 'rush', 'done'];
