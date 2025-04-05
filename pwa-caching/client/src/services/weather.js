import { getForecast, setForcast, deleteAllForecasts } from "./db";

export async function getWeather(city) {
  try {
    const cachedWeatherData = await getForecast(city);

    console.log("test", import.meta.env.VITE_API_KEY);
    if (cachedWeatherData) {
      console.log("Using cached data:", cachedWeatherData);
      return cachedWeatherData;
    }

    const weatherDataFromApi = await (
      await fetch(
        `http://api.weatherapi.com/v1/current.json?key=${
          import.meta.env.VITE_API_KEY
        }&q=${encodeURIComponent(city)}&aqi=no`
      )
    ).json();

    await setForcast(city, weatherDataFromApi);

    return weatherDataFromApi;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
}

export async function deleteForecasts() {
  try {
    await deleteAllForecasts();
    console.log("All forecasts deleted");
  } catch (error) {
    console.error("Error deleting forecasts:", error);
  }
}
