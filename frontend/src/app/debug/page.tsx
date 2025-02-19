// frontend/src/app/debug/sign-in/page.tsx

"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth/lib/authContext";
import { useState } from "react";
import { TodosVm } from "@/api/client";
import apiClient from "@/api/fetchInstance";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function Page() {
  const [toDoListResponse, setToDoListResponse] = useState<TodosVm | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const [showUserInfo, setShowUserInfo] = useState(false);

  const getToDoList = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getTodoLists();
      setToDoListResponse(response);
    } catch (err) {
      console.error("Get ToDo List Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={getToDoList}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Fetching ToDo List..." : "Get ToDo List"}
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowUserInfo(!showUserInfo)}
                className="w-full"
              >
                {showUserInfo ? "Hide User Info" : "Show User Info"}
              </Button>
              <Link
                href="/"
                className="w-full"
              >
                <Button
                  variant="outline"
                  className="w-full"
                  type="button"
                >
                  Main Page
                </Button>
              </Link>
            </div>

            {toDoListResponse && (
              <div className="p-4 bg-gray-700 rounded animate-in fade-in slide-in-from-top-4">
                <h3 className="text-white mb-2 font-semibold">ToDo List Response:</h3>
                <pre className="text-sm text-white whitespace-pre-wrap overflow-auto max-h-60">
                  {JSON.stringify(toDoListResponse, null, 2)}
                </pre>
              </div>
            )}

            {showUserInfo && user && (
              <div className="p-4 bg-gray-700 rounded animate-in fade-in slide-in-from-top-4">
                <h3 className="text-white mb-2 font-semibold">User Information:</h3>
                <pre className="text-sm text-white whitespace-pre-wrap overflow-auto max-h-60">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
