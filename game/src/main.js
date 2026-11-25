// Dapur Kilat — the frame loop and the wiring: canvas sizing, the title /
// play / day-over / game-over screens, input listeners, and the ?shot=
// scene mode the screenshots are taken from. The rules live in world.js;
// this file only runs them and draws the result.
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './config.js';
import { canvasPoint, handleClick, handleKey } from './input.js';
import { drawKitchen } from './render.js';
import { SHOT_NAMES, stageShot } from './shots.js';
import {
  createKitchen, nextDay, resetKitchen, stepKitchen,
  SCREEN_DAY_OVER, SCREEN_GAME_OVER, SCREEN_PLAY, SCREEN_TITLE,
} from './world.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusLine = document.getElementById('status');

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seedParam = Number(params.get('seed'));
const seed = Number.isFinite(seedParam) && seedParam > 0 ? seedParam : 20261125;

const kitchen = createKitchen(seed);
let screen = SCREEN_TITLE;
let lastTime = performance.now();

/** Keep the game canvas at its 1280x720 design size, letterboxed. */
function fitCanvas() {
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
}

function describeForScreenReader() {
  if (!statusLine) return;
  statusLine.textContent = 'Dapur Kilat. Skor ' + kitchen.score + ', ' + kitchen.orders.length
    + ' pesanan aktif, ' + kitchen.hearts + ' hati tersisa, shift '
    + Math.ceil(kitchen.shiftLeft) + ' detik lagi.';
}

if (shotName) {
  // Screenshot mode: stage one fixed scene, draw it once, stop.
  const staged = stageShot(SHOT_NAMES.includes(shotName) ? shotName : 'cover', kitchen);
  screen = staged.screen;
  kitchen.screen = screen;
  fitCanvas();
  drawKitchen(ctx, kitchen);
  describeForScreenReader();
} else {
  fitCanvas();
  window.addEventListener('resize', fitCanvas);

  canvas.addEventListener('pointerdown', (event) => {
    const point = canvasPoint(canvas, event.clientX, event.clientY);
    if (kitchen.screen === SCREEN_TITLE) {
      resetKitchen(kitchen);
      return;
    }
    if (kitchen.screen === SCREEN_DAY_OVER) {
      nextDay(kitchen);
      return;
    }
    if (kitchen.screen === SCREEN_GAME_OVER) {
      resetKitchen(kitchen);
      return;
    }
    handleClick(kitchen, point.x, point.y);
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === ' ') event.preventDefault();
    if (kitchen.screen === SCREEN_TITLE && (event.key === 'Enter' || event.key === ' ')) {
      resetKitchen(kitchen);
      return;
    }
    if (kitchen.screen === SCREEN_DAY_OVER && event.key === 'Enter') {
      nextDay(kitchen);
      return;
    }
    if (kitchen.screen === SCREEN_GAME_OVER && event.key === 'Enter') {
      resetKitchen(kitchen);
      return;
    }
    handleKey(kitchen, event.key);
  });

  function frame(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    stepKitchen(kitchen, dt);
    drawKitchen(ctx, kitchen);
    describeForScreenReader();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
