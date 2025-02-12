import { http, HttpResponse } from "msw";
import { WeatherForecast } from "../api/client";

// Mock data
export const demoWeatherForecasts: WeatherForecast[] = [
  {
    date: new Date(2024, 0, 1).toISOString(),
    temperatureC: 20,
    temperatureF: 68,
    summary: "Mild",
  },
  {
    date: new Date(2024, 0, 2).toISOString(),
    temperatureC: 25,
    temperatureF: 77,
    summary: "Warm",
  },
  {
    date: new Date(2024, 0, 3).toISOString(),
    temperatureC: 15,
    temperatureF: 59,
    summary: "Cool",
  },
];

// Mock handlers for weather forecasts
export const weatherForecastHandlers = [
  // Get Weather Forecasts
  http.get("*/api/WeatherForecasts", () => {
    return HttpResponse.json(demoWeatherForecasts);
  }),
];
