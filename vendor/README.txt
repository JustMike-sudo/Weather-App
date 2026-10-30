anime.js 4.5.0 (MIT) - https://animejs.com/

anime.slim.min.js  is a small build containing ONLY what this app imports
                   (animate, createTimeline, stagger, utils).
anime-entry.js     lists those imports; it is the input to the build.
anime.LICENSE.md   the library's license.

Rebuild after changing which anime.js features the app uses:
  npm install
  npm run build:vendor
