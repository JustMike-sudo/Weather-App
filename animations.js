// All motion lives here so the rest of the app stays easy to read.
// Each "Module" below adds one anime.js idea. Docs: https://animejs.com/documentation
import { animate } from './vendor/anime.esm.min.js';

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
