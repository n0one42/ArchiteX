"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth/lib/authContext";
import { useState } from "react";
import { AccessTokenResponse, ApiException, LoginRequest } from "@/api/client";
import apiClient from "@/api/fetchInstance";
import { Card, CardContent } from "@/components/ui/card";

export default function Page() {
  const [bearerResponse, setBearerResponse] = useState<AccessTokenResponse | null>(null);
  const [error, setError] = useState<ApiException | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();

  const testLoginRequest: LoginRequest = {
    email: "administrator@localhost",
    password: "Administrator1!",
  };

  // Log in using bearer mode (tokens stored in localStorage)
  const handleBearerLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.postApiUsersLogin(testLoginRequest, false);
      setBearerResponse(response);
      await login(testLoginRequest, { useCookies: false });
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err);
      } else {
        setError(
          new ApiException(
            "An unexpected error occurred",
            500,
            err instanceof Error ? err.message : "Unknown error",
            {},
            null
          )
        );
      }
      console.error("Bearer Login Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Log in using cookie mode (backend sets HTTP-only cookie)
  const handleCookieLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await login(testLoginRequest, { useCookies: true, useSessionCookies: true });
      // In cookie mode you might not have tokens stored locally.
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err);
      } else {
        setError(
          new ApiException(
            "An unexpected error occurred",
            500,
            err instanceof Error ? err.message : "Unknown error",
            {},
            null
          )
        );
      }
      console.error("Cookie Login Error:", err);
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
                onClick={handleBearerLogin}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Testing Bearer Login..." : "Test Login with Bearer"}
              </Button>

              <Button
                variant="outline"
                onClick={handleCookieLogin}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Testing Cookie Login..." : "Test Login with Cookies"}
              </Button>
            </div>

            {bearerResponse && (
              <div className="p-4 bg-gray-700 rounded animate-in fade-in slide-in-from-top-4">
                <h3 className="text-white mb-2 font-semibold">Bearer Response:</h3>
                <pre className="text-sm text-white whitespace-pre-wrap overflow-auto max-h-60">
                  {JSON.stringify(bearerResponse, null, 2)}
                </pre>
              </div>
            )}

            {user && (
              <div className="p-4 bg-gray-700 rounded animate-in fade-in slide-in-from-top-4">
                <h3 className="text-white mb-2 font-semibold">User Information:</h3>
                <pre className="text-sm text-white whitespace-pre-wrap overflow-auto max-h-60">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-500 animate-in fade-in slide-in-from-top-4">
            <CardContent className="pt-6">
              <div className="p-4 bg-red-950 rounded">
                <h3 className="text-red-500 mb-2 font-semibold">Error:</h3>
                <pre className="text-sm text-red-400 whitespace-pre-wrap overflow-auto max-h-60">
                  {JSON.stringify(error, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
