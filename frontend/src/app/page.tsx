"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TodoListsClient, TodoListDto } from "@/api/client";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [firstTodoList, setFirstTodoList] = useState<TodoListDto | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated by looking for access token
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      router.push("/sign-in");
      return;
    }
    setIsAuthenticated(true);

    // Fetch todo lists
    const client = new TodoListsClient(process.env.NEXT_PUBLIC_API_BASE_URL, {
      fetch: (url: RequestInfo, init?: RequestInit) => {
        return fetch(url, {
          ...init,
          headers: {
            ...init?.headers,
            Authorization: `Bearer ${accessToken}`,
          },
        });
      },
    });
    client
      .getTodoLists()
      .then((response) => {
        const firstList = response.lists?.[0] ?? null;
        setFirstTodoList(firstList);
      })
      .catch((error) => {
        console.error("Error fetching todo lists:", error);
        toast.error("Failed to fetch todo lists");
      });
  }, [router]);

  const handleSignOut = () => {
    // Clear authentication tokens
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
    toast.success("Successfully signed out!");
    router.push("/sign-in");
  };

  // Show nothing while checking authentication
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center px-4">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome!</CardTitle>
          {firstTodoList && <p className="text-muted-foreground">First Todo List: {firstTodoList.title}</p>}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button
              onClick={() => {
                toast.success("This is a success toast!");
                toast.error("This is an error toast!");
                toast.info("This is an info toast!");
                toast.warning("This is a warning toast!");
              }}
              className="w-full"
              variant="outline"
            >
              Test Toasts
            </Button>
            <Button
              onClick={handleSignOut}
              className="w-full"
              variant="destructive"
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
