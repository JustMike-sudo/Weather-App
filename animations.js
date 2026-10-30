// All motion lives here so the rest of the app stays easy to read.
// Each "Module" below adds one anime.js idea. Docs: https://animejs.com/documentation
import { animate, stagger } from './vendor/anime.esm.min.js';

// Some people turn on "reduce motion" in their OS because movement can make them
// feel unwell. Every animation checks this first and simply does nothing.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
export const motionOK = () => !reducedMotion.matches;

// ---------- Module 1: animate() ----------
// animate(targets, { property: value, ...options })
//   targets : what to move (here, CSS selectors)
//   [from, to] arrays say where a property starts and ends
export function playCurrentEntrance() {
  if (!motionOK()) return;

  // The weather icon pops up from small, slightly overshooting before it settles.
  animate('#icon', {
    scale: [0.4, 1],
    opacity: [0, 1],
    duration: 700,
    ease: 'outBack',
  });

  // The temperature slides up a little later, so the two feel like one sequence.
  animate('#temperature', {
    y: ['0.75rem', 0],
    opacity: [0, 1],
    duration: 500,
    delay: 150,
    ease: 'outQuad',
  });
}

// ---------- Module 2: stagger() ----------
// stagger() turns ONE value into a different value for each target.
//   delay: stagger(70)  ->  1st row waits 0ms, 2nd 70ms, 3rd 140ms ...
//   { start: 500 }      ->  adds 500ms to every delay (wait for Module 1 first)
//   { from: 'center' }  ->  counts outward from the middle instead of the first item
export function playForecastEntrance() {
  if (!motionOK()) return;

  // Three detail tiles: the middle one lands first, then the outer two together.
  animate('.details div', {
    y: ['0.5rem', 0],
    opacity: [0, 1],
    duration: 450,
    ease: 'outQuad',
    delay: stagger(90, { start: 350, from: 'center' }),
  });

  // Seven forecast rows slide in from the left, one after another.
  animate('#forecast li', {
    x: ['-1.5rem', 0],
    opacity: [0, 1],
    duration: 500,
    ease: 'outQuad',
    delay: stagger(70, { start: 500 }),
  });
}
