import { http, HttpResponse } from "msw";

import type { WeatherForecast } from "../api/client";

// Mock data
export const demoWeatherForecasts: WeatherForecast[] = [
  {
    date: new Date(2024, 0, 1).toISOString(),
    summary: "Mild",
    temperatureC: 20,
    temperatureF: 68,
  },
  {
    date: new Date(2024, 0, 2).toISOString(),
    summary: "Warm",
    temperatureC: 25,
    temperatureF: 77,
  },
  {
    date: new Date(2024, 0, 3).toISOString(),
    summary: "Cool",
    temperatureC: 15,
    temperatureF: 59,
  },
];

// Mock handlers for weather forecasts
export const weatherForecastHandlers = [
  // Get Weather Forecasts
  http.get("*/api/WeatherForecasts", () => {
    return HttpResponse.json(demoWeatherForecasts);
  }),
];
