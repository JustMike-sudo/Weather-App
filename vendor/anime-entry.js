// The ONLY anime.js parts this app uses. The bundler drops everything else
// (tree-shaking). If animations.js starts using something new, add it here and
// run: npm run build:vendor
export { animate, createTimeline, stagger, utils } from 'animejs';
