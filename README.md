# Cel-Shaded Weather

A weather app with a bold cel-shaded look, built with plain HTML, CSS and JavaScript. No framework, no build step, and **no API key**.

**Live demo:** https://justmike-sudo.github.io/Weather-App/

## Features

- **City search** with a picker when a name matches several places (e.g. "Windhoek" in Namibia vs South Africa)
- **Current conditions:** temperature, feels-like, humidity, wind and a weather icon
- **7-day forecast** with highs, lows and chance of rain
- **°C / °F toggle** that remembers your choice
- **"Use my location"** button (asks for permission first)
- **Animated, with care** (see [Animations](#animations)): staggered entrance, counting temperature, error shake and loading pulse, all switched off for people who prefer reduced motion
- **Remembers your last city** and loads it on your next visit
- **Clear errors** for unknown cities, blocked location and network failures
- Keyboard accessible, with screen reader labels and a live region for updates

## Data

Weather and city search come from [Open-Meteo](https://open-meteo.com/), a free service that needs no account or key. The app calls its geocoding and forecast APIs directly from the browser.

## Run it

Open `index.html` in a browser. (If your browser blocks geolocation on `file://`, serve the folder instead, e.g. `python -m http.server`.)

## Animations

Motion is built with [anime.js](https://animejs.com/) 4.x and lives in `animations.js`, one small function per idea:

| Idea | Where it is used |
|---|---|
| `animate()` | icon pop-in, error shake (keyframes), looping loading pulse |
| `stagger()` | detail tiles fan out from the middle; forecast rows arrive one after another |
| `createTimeline()` | the whole entrance is one sequence, so it can be finished or stopped as a unit |
| Animating a plain object | the temperature counts up, and glides when you switch °C/°F |

Design rules used throughout:
- **Reduced motion:** if the OS asks for it, nothing moves. Loading is still shown by a CSS dim, and errors by text and colour.
- **Motion never carries the only message.** Errors change the text and colour too.
- **The page always shows the correct final value first;** animation is decoration on top.
- Anything that loops is stopped by its owner, and a new animation replaces the old one instead of stacking.

The app has no build step. anime.js is vendored as a slim bundle (about 17 KB gzipped, only the parts we use) in `vendor/`. To change which features are included:

```bash
npm install
npm run build:vendor
```

## Tests

The helper functions have unit tests using Node's built-in test runner (Node 18+):

```bash
node --test
```

There is also a test that every file the page loads is copied by the deploy step in `.github/workflows/ci.yml`, so adding a script without updating the workflow fails CI instead of breaking the live site.

## Project structure

```
index.html     Markup
style.css      Cel-shaded styles
weather.js     Pure helpers: weather-code labels, unit conversion, forecast parsing
script.js      UI: search, rendering, location, unit toggle, saved city
animations.js  All motion (anime.js): entrance timeline, counting, shake, loading
vendor/        Slim anime.js bundle, its entry file and license
package.json   Test and vendor-build scripts (the app itself needs no build)
tests/         Unit tests for weather.js and a deploy-file check
```
