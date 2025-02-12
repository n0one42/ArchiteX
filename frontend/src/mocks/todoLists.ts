import { http, HttpResponse } from "msw";
import {
  TodosVm,
  TodoListDto,
  LookupDto,
  CreateTodoListCommand,
  UpdateTodoListCommand,
  PriorityLevel,
} from "../api/client";

// Mock data
export const demoTodoLists: TodoListDto[] = [
  {
    id: 1,
    title: "Work Tasks",
    colour: "#ff0000",
    items: [
      {
        id: 1,
        listId: 1,
        title: "Complete project documentation",
        done: false,
        priority: PriorityLevel.High,
        note: "Include all API endpoints",
      },
      {
        id: 2,
        listId: 1,
        title: "Review pull requests",
        done: true,
        priority: PriorityLevel.Medium,
        note: "Check code quality",
      },
    ],
  },
  {
    id: 2,
    title: "Personal Tasks",
    colour: "#00ff00",
    items: [],
  },
];

export const demoPriorityLevels: LookupDto[] = [
  { id: PriorityLevel.None, title: "None" },
  { id: PriorityLevel.Low, title: "Low" },
  { id: PriorityLevel.Medium, title: "Medium" },
  { id: PriorityLevel.High, title: "High" },
];

export const demoTodosVm: TodosVm = {
  priorityLevels: demoPriorityLevels,
  lists: demoTodoLists,
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
      id: demoTodoLists.length + 1,
      title: command.title,
      colour: "#" + Math.floor(Math.random() * 16777215).toString(16), // Random color
      items: [],
    };
    demoTodoLists.push(newList);
    return HttpResponse.json(newList.id, { status: 201 });
  }),

  // Update Todo List
  http.put("*/api/TodoLists/:id", async ({ request, params }) => {
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
