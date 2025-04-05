import { useState } from "react";
import { getWeather, deleteForecasts } from "./services/weather";
import "./App.css";

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [city, setCity] = useState("");

  const handleGetWeather = async (city) => {
    try {
      const data = await getWeather(city);
      setWeatherData(data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  return (
    <div className="App">
      <h1>Weather App</h1>
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter city name"
      />
      <button onClick={() => handleGetWeather(city)}>Get Weather</button>
      <button
        onClick={() => {
          deleteForecasts();
          setWeatherData(null);
        }}
      >
        delete all forecast
      </button>
      {weatherData ? (
        <div>
          <h2>{weatherData?.location?.name}</h2>
          <p>Temperature: {weatherData?.current?.temp_c}°C</p>
          <p>Wind: {weatherData?.current?.gust_kph} kph</p>
          <p>Humidity: {weatherData?.current?.humidity}%</p>
        </div>
      ) : (
        <div>
          <h2>Enter a city and search...</h2>
        </div>
      )}
    </div>
  );
}

export default App;
