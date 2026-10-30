// All motion lives here so the rest of the app stays easy to read.
// Each "Module" below adds one anime.js idea. Docs: https://animejs.com/documentation
import { animate, createTimeline, stagger, utils } from './vendor/anime.esm.min.js';

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
// A timeline is a conductor: .add() animations to ONE timeline and give each a
// start position relative to the previous one.
//   '<<+=150'  ->  150ms after the previous one STARTS
//   '<'        ->  right when the previous one ENDS
//
// ---------- Module 4: animating a plain object (counting numbers) ----------
// anime.js can animate ANY number, not just things on screen. We animate a plain
// object { n: 0 } up to the real value and, on every frame (onUpdate), write the
// current number into the page. The number is the animation; the text is just a
// view of it. utils.round(0) keeps it whole, so we never show "24.37°".
//
// Design rule: render() in script.js always writes the FINAL text first. The
// counting is decoration on top, so if it is skipped or interrupted the page
// still shows the right number.

// What every number animation shares. `state` is the plain object being animated.
function numberParams(state, el, { to, format }) {
  return {
    n: to,
    duration: 900,
    ease: 'outExpo',          // races ahead, then eases into the final value
    modifier: utils.round(0),
    onUpdate: () => { el.textContent = format(state.n); },
  };
}

let entrance = null; // the running entrance timeline
let counter = null;  // the running stand-alone count (used by the C/F toggle)

// `temperature` is optional: { from, to, format } makes the big temperature
// count from one number to another as part of the entrance.
export function playEntrance({ temperature } = {}) {
  // A search can finish while the last entrance is still playing. revert() stops
  // that timeline and undoes the inline styles it left on the elements.
  entrance?.revert();
  entrance = null;
  if (!motionOK()) return;

  // GOTCHA (Module 3): a timeline only applies an element's starting values when
  // that element's turn arrives, so hide everything up front. utils.set() applies
  // values immediately, before the browser paints.
  utils.set(['#icon', '#temperature', '.details div', '#forecast li'], { opacity: 0 });

  const tl = createTimeline({ defaults: { ease: 'outQuad' } })
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
    }, '<<+=150');

  if (temperature) {
    // Show the starting number while the element is still hidden...
    const el = document.querySelector('#temperature');
    el.textContent = temperature.format(temperature.from);
    // ...then count, starting at the same moment as the slide ('<<').
    // A timeline can sequence a plain object exactly like an element.
    const state = { n: temperature.from };
    tl.add(state, numberParams(state, el, temperature), '<<');
  }

  // 3. The detail tiles start 200ms later, middle tile first.
  tl.add('.details div', {
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

  entrance = tl;
}

// Jump any running entrance straight to its finished state. Used when the user
// does something else (like switching units) mid-animation.
export function skipEntrance() {
  entrance?.complete();
  entrance = null;
}

// Count the number shown in `el` from `from` to `to`; `format(n)` builds the text.
export function countNumber(el, from, to, format) {
  counter?.cancel();
  counter = null;
  if (!motionOK() || from === to) return;

  // render() just wrote the FINAL text. Show the starting number right now, or
  // the final one would flash for a frame before the count begins.
  el.textContent = format(from);

  const state = { n: from };
  counter = animate(state, numberParams(state, el, { to, format }));
}
