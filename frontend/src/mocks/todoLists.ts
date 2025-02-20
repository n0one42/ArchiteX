import { http, HttpResponse } from "msw";

import type { CreateTodoListCommand, LookupDto, TodoListDto, TodosVm, UpdateTodoListCommand } from "../api/client";

import { PriorityLevel } from "../api/client";

// Mock data
export const demoTodoLists: TodoListDto[] = [
  {
    colour: "#ff0000",
    id: 1,
    items: [
      {
        done: false,
        id: 1,
        listId: 1,
        note: "Include all API endpoints",
        priority: PriorityLevel.High,
        title: "Complete project documentation",
      },
      {
        done: true,
        id: 2,
        listId: 1,
        note: "Check code quality",
        priority: PriorityLevel.Medium,
        title: "Review pull requests",
      },
    ],
    title: "Work Tasks",
  },
  {
    colour: "#00ff00",
    id: 2,
    items: [],
    title: "Personal Tasks",
  },
];

export const demoPriorityLevels: LookupDto[] = [
  { id: PriorityLevel.None, title: "None" },
  { id: PriorityLevel.Low, title: "Low" },
  { id: PriorityLevel.Medium, title: "Medium" },
  { id: PriorityLevel.High, title: "High" },
];

export const demoTodosVm: TodosVm = {
  lists: demoTodoLists,
  priorityLevels: demoPriorityLevels,
};

// Mock handlers for todo lists
export const todoListHandlers = [
  // Get Todo Lists
  http.get("*/api/TodoLists", () => {
    return HttpResponse.json(demoTodosVm);
  }),

  // Create Todo List
  http.post("*/api/TodoLists", async ({ request }) => {
    const command = (await request.json()) as CreateTodoListCommand;
    const newList: TodoListDto = {
      colour: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random color
      id: demoTodoLists.length + 1,
      items: [],
      title: command.title,
    };
    demoTodoLists.push(newList);
    return HttpResponse.json(newList.id, { status: 201 });
  }),

  // Update Todo List
  http.put("*/api/TodoLists/:id", async ({ params, request }) => {
    const id = parseInt(params.id as string);
    const command = (await request.json()) as UpdateTodoListCommand;
    const listIndex = demoTodoLists.findIndex((list) => list.id === id);

    if (listIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    demoTodoLists[listIndex] = {
      ...demoTodoLists[listIndex],
      title: command.title ?? demoTodoLists[listIndex]?.title,
    };

    return new HttpResponse(null, { status: 204 });
  }),

  // Delete Todo List
  http.delete("*/api/TodoLists/:id", ({ params }) => {
    const id = parseInt(params.id as string);
    const listIndex = demoTodoLists.findIndex((list) => list.id === id);

    if (listIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    demoTodoLists.splice(listIndex, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
