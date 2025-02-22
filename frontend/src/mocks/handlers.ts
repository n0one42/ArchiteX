import { todoItemHandlers } from "@/mocks/todoItems";
import { todoListHandlers } from "@/mocks/todoLists";
import { userHandlers } from "@/mocks/users";
import { weatherForecastHandlers } from "@/mocks/weatherForecasts";

export const handlers = [
  ...userHandlers,
  ...todoItemHandlers,
  ...todoListHandlers,
  ...weatherForecastHandlers,
  // Add any other handlers here
];
