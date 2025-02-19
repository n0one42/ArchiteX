"use client";

import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./authContext";
import { ApiException, InfoResponse, LoginRequest } from "@/api/client";
import apiClient from "@/api/fetchInstance";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiException | null>(null);
  const [user, setUser] = useState<InfoResponse | null>(null);

  // API client instance with configured fetch
  const client = useMemo(() => apiClient, []);

  // Fetch user info - only when authenticated
  const fetchUserInfo = useCallback(async () => {
    try {
      const userInfo = await client.getApiUsersManageInfo();
      setUser(userInfo);
    } catch (error) {
      console.error("Failed to fetch user info:", error);
      // If fetching user info fails, we should clear the auth state
      setUser(null);
    }
  }, [client]);

  // Login function
  const login = useCallback(
    async (request: LoginRequest, options?: { useCookies?: boolean; useSessionCookies?: boolean }) => {
      setIsLoading(true);
      setError(null);

      try {
        // The backend returns an OK status with no content,
        // so we don't need to check for a loginResponse value.
        await client.postApiUsersLogin(request, options?.useCookies, options?.useSessionCookies);
        await fetchUserInfo();

        // Check for a redirect query parameter and redirect if it exists
        const params = new URLSearchParams(window.location.search);
        const redirectUrl = params.get("redirect");
        if (redirectUrl) {
          // Remove the redirect query parameter from the URL
          window.history.replaceState(null, "", window.location.pathname);
          window.location.href = redirectUrl;
        }
      } catch (error: unknown) {
        if (ApiException.isApiException(error)) {
          setError(error);
        } else {
          setError(
            new ApiException("Authentication failed", 500, "An unexpected error occurred during login", {}, error)
          );
        }
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [client, fetchUserInfo]
  );

  // Logout function
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      // Dummy call: Call backend logout endpoint to clear cookies (implement later)
      // await client.postApiUsersLogout();
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith("/sign-in") && !currentPath.startsWith("/sign-out")) {
        fetchUserInfo();
      }
    }
  }, [fetchUserInfo]);

  // Listen for unauthorized events triggered by the API client (e.g., from a 401 response)
  useEffect(() => {
    const handleUnauthorized = () => {
      console.warn("Received unauthorized event, clearing user state.");
      setUser(null);
      // Save the current URL as a redirect parameter
      const redirectUrl = window.location.pathname + window.location.search;
      window.location.href = `/sign-in?redirect=${encodeURIComponent(redirectUrl)}`;
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      isLoading,
      error,
      user,
      login,
      logout,
      clearError,
    }),
    [isLoading, error, user, login, logout, clearError]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
