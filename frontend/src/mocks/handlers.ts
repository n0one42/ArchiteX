import { userHandlers } from "./users";
import { todoItemHandlers } from "./todoItems";
import { todoListHandlers } from "./todoLists";
import { weatherForecastHandlers } from "./weatherForecasts";

export const handlers = [
  ...userHandlers,
  ...todoItemHandlers,
  ...todoListHandlers,
  ...weatherForecastHandlers,
  // Add any other handlers here
];
