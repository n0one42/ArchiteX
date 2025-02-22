import type {
  CreateTodoItemCommand,
  PaginatedListOfTodoItemBriefDto,
  TodoItemBriefDto,
  UpdateTodoItemCommand,
} from "@/api/client";

import { http, HttpResponse } from "msw";

// Mock data
export const demoTodoItems: TodoItemBriefDto[] = [
  {
    done: false,
    id: 1,
    listId: 1,
    title: "Complete project documentation",
  },
  {
    done: true,
    id: 2,
    listId: 1,
    title: "Review pull requests",
  },
];

// Mock paginated response
export const demoPaginatedTodoItems: PaginatedListOfTodoItemBriefDto = {
  hasNextPage: false,
  hasPreviousPage: false,
  items: demoTodoItems,
  pageNumber: 1,
  totalCount: demoTodoItems.length,
  totalPages: 1,
};

// Mock handlers for todo items
export const todoItemHandlers = [
  // Get Todo Items with Pagination
  http.get("*/api/TodoItems", () => {
    return HttpResponse.json(demoPaginatedTodoItems);
  }),

  // Create Todo Item
  http.post("*/api/TodoItems", async ({ request }) => {
    const command = (await request.json()) as CreateTodoItemCommand;
    const newItem: TodoItemBriefDto = {
      done: false,
      id: demoTodoItems.length + 1,
      listId: command.listId,
      title: command.title,
    };
    demoTodoItems.push(newItem);
    return HttpResponse.json(newItem.id, { status: 201 });
  }),

  // Update Todo Item
  http.put("*/api/TodoItems/:id", async ({ params, request }) => {
    const id = parseInt(params.id as string);
    const command = (await request.json()) as UpdateTodoItemCommand;
    const itemIndex = demoTodoItems.findIndex((item) => item.id === id);

    if (itemIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    demoTodoItems[itemIndex] = {
      ...demoTodoItems[itemIndex],
      done: command.done ?? demoTodoItems[itemIndex]?.done,
      title: command.title ?? demoTodoItems[itemIndex]?.title,
    };

    return new HttpResponse(null, { status: 204 });
  }),

  // Delete Todo Item
  http.delete("*/api/TodoItems/:id", ({ params }) => {
    const id = parseInt(params.id as string);
    const itemIndex = demoTodoItems.findIndex((item) => item.id === id);

    if (itemIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    demoTodoItems.splice(itemIndex, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // Update Todo Item Detail
  http.put("*/api/TodoItems/UpdateDetail/:id", async ({ params }) => {
    const id = parseInt(params.id as string);
    const itemIndex = demoTodoItems.findIndex((item) => item.id === id);

    if (itemIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
