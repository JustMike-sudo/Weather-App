/*
  Weather helpers — pure functions with no DOM access, so they can be
  unit tested from Node. Data comes from Open-Meteo (no API key needed).
*/
(function (root) {
  "use strict";

  // WMO weather interpretation codes -> label + emoji.
  // https://open-meteo.com/en/docs#weathervariables
  const CODES = [
    [[0], "Clear sky", "☀️"],
    [[1], "Mostly clear", "🌤️"],
    [[2], "Partly cloudy", "⛅"],
    [[3], "Overcast", "☁️"],
    [[45, 48], "Fog", "🌫️"],
    [[51, 53, 55], "Drizzle", "🌦️"],
    [[56, 57], "Freezing drizzle", "🌧️"],
    [[61, 63, 65], "Rain", "🌧️"],
    [[66, 67], "Freezing rain", "🌧️"],
    [[71, 73, 75, 77], "Snow", "❄️"],
    [[80, 81, 82], "Rain showers", "🌦️"],
    [[85, 86], "Snow showers", "🌨️"],
    [[95], "Thunderstorm", "⛈️"],
    [[96, 99], "Thunderstorm with hail", "⛈️"],
  ];

  function describeCode(code) {
    const hit = CODES.find(([codes]) => codes.includes(code));
    return hit ? { condition: hit[1], icon: hit[2] } : { condition: "Unknown", icon: "🌡️" };
  }

  const toFahrenheit = (c) => (c * 9) / 5 + 32;

  // The whole number shown for a temperature in the given unit.
  function convertTemp(celsius, unit) {
    return Math.round(unit === "F" ? toFahrenheit(celsius) : celsius);
  }

  function formatTemp(celsius, unit) {
    if (celsius == null || Number.isNaN(celsius)) return "--°";
    return convertTemp(celsius, unit) + "°";
  }

  // "2026-10-30" -> "Fri". Parsed as a local date so the weekday can't
  // shift when the viewer's timezone is behind UTC.
  function weekday(isoDate, index) {
    if (index === 0) return "Today";
    const [y, m, d] = isoDate.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short" });
  }

  function placeName(place) {
    return [place.name, place.admin1, place.country].filter(Boolean)
      .filter((part, i, all) => all.indexOf(part) === i)
      .join(", ");
  }

  // Turns the raw Open-Meteo forecast payload into what the UI needs.
  function parseForecast(data) {
    const cur = data && data.current;
    const daily = data && data.daily;
    if (!cur || !daily || !Array.isArray(daily.time)) throw new Error("Unexpected weather data");
    return {
      current: {
        temp: cur.temperature_2m,
        feelsLike: cur.apparent_temperature,
        humidity: cur.relative_humidity_2m,
        wind: cur.wind_speed_10m,
        ...describeCode(cur.weather_code),
      },
      days: daily.time.map((date, i) => ({
        date,
        label: weekday(date, i),
        max: daily.temperature_2m_max[i],
        min: daily.temperature_2m_min[i],
        rain: daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : null,
        ...describeCode(daily.weather_code[i]),
      })),
    };
  }

  const api = { describeCode, toFahrenheit, convertTemp, formatTemp, weekday, placeName, parseForecast };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Weather = api;
})(this);
