"use client";

import type { InfoResponse, LoginRequest } from "@/api/client";
import type { ReactNode } from "react";

import { ApiException } from "@/api/client";
import apiClient from "@/api/fetchInstance";
import { AuthContext } from "@/auth/lib/authContext";
import { paths } from "@/routes/paths";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiException | null>(null);
  const [user, setUser] = useState<InfoResponse | null>(null);
  const router = useRouter();

  // Memoize the API client
  const client = useMemo(() => apiClient, []);

  // Fetch user info from the API
  const fetchUserInfo = useCallback(async () => {
    try {
      const userInfo = await client.getApiUsersManageInfo();
      setUser(userInfo);
    } catch (err) {
      console.error("Failed to fetch user info:", err);
      setUser(null);
    }
  }, [client]);

  // Login function
  const login = useCallback(
    async (request: LoginRequest, options?: { useCookies?: boolean; useSessionCookies?: boolean }) => {
      setIsLoading(true);
      setError(null);
      try {
        await client.postApiUsersLogin(request, options?.useCookies, options?.useSessionCookies);
        await fetchUserInfo();

        const params = new URLSearchParams(window.location.search);
        const redirectUrl = params.get("redirect") || paths.root;
        router.push(redirectUrl);
      } catch (err: unknown) {
        if (ApiException.isApiException(err)) {
          setError(err);
        } else {
          setError(new ApiException("Authentication failed", 500, "Unexpected error during login", {}, err));
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client, fetchUserInfo, router]
  );

  // Logout function
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      setUser(null);
      router.push(paths.auth.signOut);
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    if (path !== "/" && !path.startsWith(paths.auth.signIn) && !path.startsWith(paths.auth.signOut)) {
      fetchUserInfo();
    }
  }, [fetchUserInfo]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      const redirectUrl = window.location.pathname + window.location.search;
      router.push(`${paths.auth.signIn}?redirect=${encodeURIComponent(redirectUrl)}`);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [router]);

  const contextValue = useMemo(
    () => ({ clearError, error, isLoading, login, logout, user }),
    [clearError, error, isLoading, login, logout, user]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
