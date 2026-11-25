// Dapur Kilat — all tunable numbers in one place: recipes, ingredients,
// kitchen layout, timers and difficulty. Nothing here draws or listens;
// it only describes the game so world.js and render.js can stay small.
export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

export const SHIFT_SECONDS = 150;
export const MAX_HEARTS = 3;
export const MAX_OPEN_ORDERS = 3;
export const COMBO_STEP = 0.1;

// One hand slot only: the cook carries a single item, so every dish forces
// a planned route between bins, board, wok and plate.
export const HAND_CAPACITY = 1;
export const PLATE_CAPACITY = 3;

// An ingredient is raw until prepared. chop = needs the cutting board,
// cook = needs the wok, ready = goes straight onto the plate.
export const INGREDIENTS = {
  nasi: { name: 'Nasi', prep: 'ready', color: '#fff3c4', accent: '#e8c85a', key: '1', blurb: 'langsung saji' },
  mie: { name: 'Mie', prep: 'cook', color: '#ffd98a', accent: '#d99a26', key: '2', blurb: 'masak di wajan' },
  telur: { name: 'Telur', prep: 'cook', color: '#ffe9a8', accent: '#f2b705', key: '3', blurb: 'goreng di wajan' },
  ayam: { name: 'Ayam', prep: 'cook', color: '#f6b26b', accent: '#c46a1b', key: '4', blurb: 'goreng di wajan' },
  cabai: { name: 'Cabai', prep: 'chop', color: '#ff5a4e', accent: '#b81f14', key: '5', blurb: 'potong di talenan' },
  sayur: { name: 'Sayur', prep: 'chop', color: '#7ed957', accent: '#2f7d1e', key: '6', blurb: 'potong di talenan' },
  bawang: { name: 'Bawang', prep: 'chop', color: '#e8b4f0', accent: '#8e44ad', key: '7', blurb: 'potong di talenan' },
};
export const INGREDIENT_ORDER = ['nasi', 'mie', 'telur', 'ayam', 'cabai', 'sayur', 'bawang'];

// A recipe is the exact set of prepared items a plate must hold.
export const RECIPES = {
  nasiGoreng: {
    name: 'Nasi Goreng', items: ['nasi', 'telur', 'bawang'],
    reward: 100, color: '#ffb703', tagline: 'klasik warteg',
  },
  ayamGeprek: {
    name: 'Ayam Geprek', items: ['ayam', 'cabai', 'nasi'],
    reward: 130, color: '#fb8500', tagline: 'pedas nampol',
  },
  mieGoreng: {
    name: 'Mie Goreng', items: ['mie', 'telur', 'sayur'],
    reward: 110, color: '#e07a2f', tagline: 'cepat saji',
  },
  sotoAyam: {
    name: 'Soto Ayam', items: ['ayam', 'nasi', 'bawang'],
    reward: 120, color: '#f4a259', tagline: 'kuah hangat',
  },
  gadoGado: {
    name: 'Gado-Gado', items: ['sayur', 'telur', 'bawang'],
    reward: 90, color: '#80b918', tagline: 'sayur segar',
  },
};
export const RECIPE_ORDER = ['nasiGoreng', 'ayamGeprek', 'mieGoreng', 'sotoAyam', 'gadoGado'];

// Difficulty ramps with the level: orders arrive faster and expire sooner,
// but the cook never gets extra chores — only tighter pressure.
export function levelTuning(level) {
  return {
    spawnEverySeconds: Math.max(7, 15 - level),
    orderSeconds: Math.max(28, 50 - level * 3),
    chopSeconds: 1.4,
    cookSeconds: 2.2,
    burnGraceSeconds: 3.5,
  };
}

// Kitchen floor plan, top-down. Counters hug the top wall under the order
// board; the cook walks the open floor below them.
export const LAYOUT = {
  hud: { x: 0, y: 0, w: 1280, h: 62 },
  orders: { x: 16, y: 70, w: 1248, h: 96 },
  bins: { x: 16, y: 178, w: 660, h: 104 },
  board: { x: 692, y: 178, w: 168, h: 104 },
  stove: { x: 876, y: 178, w: 168, h: 104 },
  serve: { x: 1060, y: 178, w: 204, h: 104 },
  plate: { x: 692, y: 300, w: 352, h: 118 },
  trash: { x: 16, y: 300, w: 150, h: 118 },
  floor: { x: 0, y: 436, w: 1280, h: 284 },
  chefHome: { x: 640, y: 590 },
};

export const CHEF_SPEED = 460;
export const CHOP_MASH_BONUS = 0.22;
