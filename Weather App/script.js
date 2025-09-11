// ===========================
// 🔑 Meteoblue API Setup
// ===========================
const METEOBLUE_API_KEY = "fPdjCQ1cmJT3Vz2Z";
const METEOBLUE_BASE_URL = "https://my.meteoblue.com/packages/basic-1h_basic-day_clouds-day";

// ===========================
// 🌦️ Weather Search Function
// ===========================
async function searchWeather() {
  const city = document.getElementById("city-input").value.trim();
  const cityNameEl = document.getElementById("city-name");
  const tempEl = document.getElementById("temperature");
  const descEl = document.getElementById("description");

  if (!city) {
    alert("Please enter a city name.");
    return;
  }

  try {
    // Show loading state
    cityNameEl.textContent = "Fetching weather...";
    tempEl.textContent = "";
    descEl.textContent = "";

    // 1. Geocode the city → get latitude & longitude
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      cityNameEl.textContent = "";
      alert(`No results found for "${city}". Try another city.`);
      return;
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    // 2. Build Meteoblue API URL
    const weatherUrl = `${METEOBLUE_BASE_URL}?apikey=${METEOBLUE_API_KEY}&lat=${latitude}&lon=${longitude}&asl=0&format=json`;

    // 3. Fetch weather data
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    console.log("Weather data:", weatherData);

    // 4. Update UI safely
    cityNameEl.textContent = `${name}, ${country}`;
    if (weatherData && weatherData.data_day) {
      const temps = weatherData.data_day.temperature_max || [];
      const clouds = weatherData.data_day.cloudcover || [];

      tempEl.textContent = temps.length > 0 ? temps[0] + "°C" : "N/A";
      descEl.textContent = clouds.length > 0
        ? "Cloud Cover: " + clouds[0] + "%"
        : "Weather description unavailable.";
    } else {
      tempEl.textContent = "N/A";
      descEl.textContent = "Weather data not available.";
    }
  } catch (error) {
    console.error("Error during searchWeather:", error);
    cityNameEl.textContent = "";
    alert("Something went wrong while fetching weather data. Check console for details.");
  }
}
