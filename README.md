# Cel-Shaded Weather

A weather app with a bold cel-shaded look, built with plain HTML, CSS and JavaScript. No framework, no build step, and **no API key**.

**Live demo:** https://justmike-sudo.github.io/Weather-App/

## Features

- **City search** with a picker when a name matches several places (e.g. "Windhoek" in Namibia vs South Africa)
- **Current conditions:** temperature, feels-like, humidity, wind and a weather icon
- **7-day forecast** with highs, lows and chance of rain
- **°C / °F toggle** that remembers your choice
- **"Use my location"** button (asks for permission first)
- **Remembers your last city** and loads it on your next visit
- **Clear errors** for unknown cities, blocked location and network failures
- Keyboard accessible, with screen reader labels and a live region for updates

## Data

Weather and city search come from [Open-Meteo](https://open-meteo.com/), a free service that needs no account or key. The app calls its geocoding and forecast APIs directly from the browser.

## Run it

Open `index.html` in a browser. (If your browser blocks geolocation on `file://`, serve the folder instead, e.g. `python -m http.server`.)

## Tests

The helper functions have unit tests using Node's built-in test runner (Node 18+):

```bash
node --test
```

## Project structure

```
index.html     Markup
style.css      Cel-shaded styles
weather.js     Pure helpers: weather-code labels, unit conversion, forecast parsing
script.js      UI: search, rendering, location, unit toggle, saved city
tests/         Unit tests for weather.js
```
