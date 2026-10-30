// Run with: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const W = require("../weather.js");

test("describeCode maps WMO codes and falls back for unknown ones", () => {
  assert.equal(W.describeCode(0).condition, "Clear sky");
  assert.equal(W.describeCode(63).condition, "Rain");
  assert.equal(W.describeCode(95).condition, "Thunderstorm");
  assert.equal(W.describeCode(1234).condition, "Unknown");
});

test("temperature formatting", () => {
  assert.equal(W.formatTemp(21.6, "C"), "22°");
  assert.equal(W.formatTemp(0, "F"), "32°");
  assert.equal(W.formatTemp(100, "F"), "212°");
  assert.equal(W.formatTemp(-3.4, "C"), "-3°");
  assert.equal(W.formatTemp(null, "C"), "--°");
});

test("convertTemp returns the whole number shown in each unit", () => {
  assert.equal(W.convertTemp(25, "C"), 25);
  assert.equal(W.convertTemp(25, "F"), 77);
  assert.equal(W.convertTemp(21.6, "C"), 22);
  assert.equal(W.convertTemp(-3.4, "C"), -3);
});

test("weekday labels do not shift with timezone", () => {
  assert.equal(W.weekday("2026-10-30", 0), "Today");
  assert.equal(W.weekday("2026-10-30", 1), "Fri");
  assert.equal(W.weekday("2026-11-01", 2), "Sun");
});

test("placeName skips empty and duplicate parts", () => {
  assert.equal(W.placeName({ name: "Windhoek", admin1: "Khomas", country: "Namibia" }), "Windhoek, Khomas, Namibia");
  assert.equal(W.placeName({ name: "Singapore", admin1: "Singapore", country: "Singapore" }), "Singapore");
  assert.equal(W.placeName({ name: "Paris" }), "Paris");
});

test("parseForecast shapes the Open-Meteo payload", () => {
  const f = W.parseForecast({
    current: { temperature_2m: 20, apparent_temperature: 19, relative_humidity_2m: 40, wind_speed_10m: 12, weather_code: 2 },
    daily: {
      time: ["2026-10-30", "2026-10-31"],
      weather_code: [2, 61],
      temperature_2m_max: [24, 18],
      temperature_2m_min: [10, 9],
      precipitation_probability_max: [5, 80],
    },
  });
  assert.equal(f.current.condition, "Partly cloudy");
  assert.equal(f.days.length, 2);
  assert.equal(f.days[0].label, "Today");
  assert.equal(f.days[1].rain, 80);
  assert.equal(f.days[1].condition, "Rain");
  assert.equal(f.days[1].label, "Sat");
});

test("parseForecast rejects bad payloads", () => {
  assert.throws(() => W.parseForecast({}), /Unexpected weather data/);
  assert.throws(() => W.parseForecast(null), /Unexpected weather data/);
});
