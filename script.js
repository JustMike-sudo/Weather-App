import { playEntrance, skipEntrance, countNumber } from "./animations.js";

// UI layer. Pure helpers live in weather.js (window.Weather).
// Data: Open-Meteo geocoding + forecast APIs, which need no API key.
(function () {
  "use strict";

  const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
  const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

  const $ = (id) => document.getElementById(id);
  // The big temperature as a whole number in the current unit, and as text.
  const shownTemp = (celsius) => Weather.convertTemp(celsius, unit);
  const tempText = (n) => n + "°" + unit;
  const form = $("search-form");
  const input = $("city-input");
  const currentEl = $("current");
  const forecastEl = $("forecast");
  const suggestionsEl = $("suggestions");

  let unit = load("weather-unit", "C");
  let lastForecast = null;
  let lastPlace = "";
  let requestId = 0; // ignore responses that arrive after a newer request

  function load(key, fallback) {
    try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, value); } catch { /* storage unavailable */ }
  }

  async function getJson(url, params) {
    const res = await fetch(url + "?" + new URLSearchParams(params));
    if (!res.ok) throw new Error("The weather service is unavailable (" + res.status + ")");
    return res.json();
  }

  async function findPlaces(query) {
    const data = await getJson(GEO_URL, { name: query, count: 5, language: "en", format: "json" });
    return data.results || [];
  }

  function fetchForecast(lat, lon) {
    return getJson(FORECAST_URL, {
      latitude: lat,
      longitude: lon,
      current: "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
      timezone: "auto",
      forecast_days: 7,
    });
  }

  // ---------- Rendering ----------
  function setStatus(location, message) {
    $("city-name").textContent = location;
    $("description").textContent = message;
  }

  function render() {
    if (!lastForecast) return;
    const { current, days } = lastForecast;
    $("city-name").textContent = lastPlace;
    $("icon").textContent = current.icon;
    $("temperature").textContent = Weather.formatTemp(current.temp, unit) + unit;
    $("description").textContent = current.condition;
    $("feels-like").textContent = Weather.formatTemp(current.feelsLike, unit);
    $("humidity").textContent = Math.round(current.humidity) + "%";
    $("wind").textContent = Math.round(current.wind) + " km/h";
    $("details").hidden = false;

    forecastEl.replaceChildren(...days.map((day) => {
      const li = document.createElement("li");
      const parts = [
        ["day", day.label],
        ["f-icon", day.icon],
        ["rain", day.rain == null ? "" : "💧 " + day.rain + "%"],
        ["range", Weather.formatTemp(day.max, unit) + " / " + Weather.formatTemp(day.min, unit)],
      ];
      for (const [cls, text] of parts) {
        const span = document.createElement("span");
        span.className = cls;
        span.textContent = text;
        if (cls === "f-icon") {
          span.setAttribute("role", "img");
          span.setAttribute("aria-label", day.condition);
          span.title = day.condition;
        }
        li.append(span);
      }
      return li;
    }));
  }

  // ---------- Loading a place ----------
  async function showPlace(place) {
    const id = ++requestId;
    hideSuggestions();
    currentEl.setAttribute("aria-busy", "true");
    currentEl.classList.add("loading");
    setStatus(Weather.placeName(place), "Fetching weather...");
    try {
      const forecast = Weather.parseForecast(await fetchForecast(place.latitude, place.longitude));
      if (id !== requestId) return;
      // Count from the number on screen now (or from 0 the first time).
      const fromTemp = lastForecast ? shownTemp(lastForecast.current.temp) : 0;
      lastForecast = forecast;
      lastPlace = Weather.placeName(place);
      save("weather-last-place", JSON.stringify(place));
      render();
      playEntrance({ temperature: { from: fromTemp, to: shownTemp(forecast.current.temp), format: tempText } });
    } catch (err) {
      if (id !== requestId) return;
      lastForecast = null;
      forecastEl.replaceChildren();
      $("details").hidden = true;
      $("icon").textContent = "⚠️";
      $("temperature").textContent = "--°";
      setStatus(Weather.placeName(place), err instanceof TypeError
        ? "Couldn't reach the weather service. Check your connection."
        : err.message);
    } finally {
      if (id === requestId) {
        currentEl.setAttribute("aria-busy", "false");
        currentEl.classList.remove("loading");
      }
    }
  }

  async function search(query) {
    requestId++; // cancels any forecast still loading
    hideSuggestions();
    setStatus("Searching...", "");
    try {
      const places = await findPlaces(query);
      if (places.length === 0) {
        setStatus("No results", "Couldn't find \"" + query + "\". Try another city.");
      } else if (places.length === 1) {
        showPlace(places[0]);
      } else {
        showSuggestions(places);
        setStatus("Pick a place", "Several matches for \"" + query + "\".");
      }
    } catch {
      setStatus("Search failed", "Couldn't reach the search service. Check your connection.");
    }
  }

  // ---------- Suggestions ----------
  function showSuggestions(places) {
    suggestionsEl.replaceChildren(...places.map((place) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = Weather.placeName(place);
      btn.addEventListener("click", () => showPlace(place));
      li.append(btn);
      return li;
    }));
    suggestionsEl.hidden = false;
  }
  function hideSuggestions() {
    suggestionsEl.hidden = true;
    suggestionsEl.replaceChildren();
  }

  // ---------- Events ----------
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (query) search(query);
  });

  $("locate-btn").addEventListener("click", () => {
    if (!navigator.geolocation) {
      setStatus("Location unavailable", "Your browser doesn't support geolocation.");
      return;
    }
    setStatus("Locating...", "");
    navigator.geolocation.getCurrentPosition(
      (pos) => showPlace({ name: "Your location", latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => setStatus("Location blocked", "Allow location access, or search for a city instead."),
      { timeout: 10000 }
    );
  });

  function syncUnitButtons() {
    document.querySelectorAll(".unit").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.unit === unit)));
  }
  document.querySelectorAll(".unit").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.unit === unit) return;
      skipEntrance(); // let any entrance finish so the old number is on screen
      const before = lastForecast ? shownTemp(lastForecast.current.temp) : null;
      unit = btn.dataset.unit;
      save("weather-unit", unit);
      syncUnitButtons();
      render(); // writes the final text for the new unit
      if (before !== null) {
        // glide from the old number to the new one, e.g. 77 -> 25
        countNumber($("temperature"), before, shownTemp(lastForecast.current.temp), tempText);
      }
    });
  });

  document.addEventListener("click", (e) => {
    if (!suggestionsEl.contains(e.target) && e.target !== input) hideSuggestions();
  });

  // ---------- Start ----------
  syncUnitButtons();
  try {
    const saved = JSON.parse(load("weather-last-place", "null"));
    if (saved && typeof saved.latitude === "number") showPlace(saved);
  } catch { /* ignore bad saved data */ }
})();
