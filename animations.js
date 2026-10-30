// All motion lives here so the rest of the app stays easy to read.
// Each "Module" below adds one anime.js idea. Docs: https://animejs.com/documentation
import { createTimeline, stagger, utils } from './vendor/anime.esm.min.js';

// Some people turn on "reduce motion" in their OS because movement can make them
// feel unwell. Every animation checks this first and simply does nothing.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
export const motionOK = () => !reducedMotion.matches;

// ---------- Module 1: animate() ----------
// animate(targets, { property: value, ...options }) moves things.
//   [from, to] arrays say where a property starts and ends.
//
// ---------- Module 2: stagger() ----------
// stagger() turns ONE value into a different value for each target.
//   delay: stagger(70)  ->  1st row waits 0ms, 2nd 70ms, 3rd 140ms ...
//   { from: 'center' }  ->  counts outward from the middle instead of the first item
//
// ---------- Module 3: createTimeline() ----------
// A timeline is a conductor. Instead of four separate animate() calls that each
// need hand-picked start times, we .add() them to ONE timeline and say where each
// one begins relative to the previous one.
//
// Position (the 3rd argument of .add) is relative to the PREVIOUS animation:
//   '<<+=150'  ->  150ms after the previous one STARTS
//   '<'        ->  right when the previous one ENDS
//   '-=100'    ->  100ms before the last one ends
//   (no value) ->  after everything so far
// Because positions are relative, changing one duration or offset moves
// everything after it, so the sequence stays in sync.

let entrance = null; // the running timeline, so we can stop it if a new search starts

export function playEntrance() {
  // A search can finish while the last entrance is still playing. revert() stops
  // that timeline and undoes the inline styles it left on the elements.
  entrance?.revert();
  entrance = null;
  if (!motionOK()) return;

  // GOTCHA: a timeline only applies an element's starting values when that
  // element's turn arrives. Until then the new data would sit on screen fully
  // visible, then vanish and fade in. So we hide everything up front.
  // utils.set() applies the values immediately, before the browser paints.
  utils.set(['#icon', '#temperature', '.details div', '#forecast li'], { opacity: 0 });

  entrance = createTimeline({ defaults: { ease: 'outQuad' } })
    // 1. The icon pops in (it is first, so it starts at 0).
    .add('#icon', {
      scale: [0.4, 1],
      opacity: [0, 1],
      duration: 700,
      ease: 'outBack',
    })
    // 2. The temperature slides up 150ms after the icon starts.
    .add('#temperature', {
      y: ['0.75rem', 0],
      opacity: [0, 1],
      duration: 500,
    }, '<<+=150')
    // 3. The detail tiles start 200ms after that, middle tile first.
    .add('.details div', {
      y: ['0.5rem', 0],
      opacity: [0, 1],
      duration: 450,
      delay: stagger(90, { from: 'center' }),
    }, '<<+=200')
    // 4. The forecast rows start 150ms after the tiles, one after another.
    .add('#forecast li', {
      x: ['-1.5rem', 0],
      opacity: [0, 1],
      duration: 500,
      delay: stagger(70),
    }, '<<+=150');
}
