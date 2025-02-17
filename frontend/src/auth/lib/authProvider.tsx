// frontend/src/auth/lib/authProvider.tsx

"use client";

import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./authContext";
import { AuthTokens, TOKEN_REFRESH_THRESHOLD } from "./types";
import { ApiException, InfoResponse, LoginRequest } from "@/api/client";
import apiClient from "@/api/fetchInstance";
import { getAuthTokens, storeTokens, clearTokens, isTokenExpired } from "./utils";

interface JwtAuthProviderProps {
  children: ReactNode;
}

export function JwtAuthProvider({ children }: JwtAuthProviderProps) {
  const [tokens, setTokens] = useState<AuthTokens | null>(() => getAuthTokens());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiException | null>(null);
  const [user, setUser] = useState<InfoResponse | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // API client instance with configured fetch
  const client = useMemo(() => apiClient, []);

  // Computed authentication state
  const isAuthenticated = Boolean(tokens?.accessToken);

  // Fetch user info
  const fetchUserInfo = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const userInfo = await client.getApiUsersManageInfo();
      setUser(userInfo);
    } catch (error) {
      console.error("Failed to fetch user info:", error);
    }
  }, [client, isAuthenticated]);

  // Login function
  const login = useCallback(
    async (request: LoginRequest, options?: { useCookies?: boolean; useSessionCookies?: boolean }) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await client.postApiUsersLogin(request, options?.useCookies, options?.useSessionCookies);

        if (!options?.useCookies && response.accessToken) {
          const tokens: AuthTokens = {
            tokenType: response.tokenType!,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken!,
            expiresIn: Date.now() + response.expiresIn! * 1000, // Convert seconds to milliseconds and add to current time
          };
          storeTokens(tokens);
          setTokens(tokens);
        } else if (options?.useCookies) {
          // In cookie mode, you let the backend set the cookie.
          // Optionally, you could update your state to indicate you're “logged in”
          // without storing tokens in localStorage.
          // For example, you might clear any stored tokens:
          clearTokens();
          setTokens(null);
        }

        await fetchUserInfo();
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
      clearTokens();
      setTokens(null);
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh tokens function
  const refreshTokens = useCallback(async () => {
    if (!tokens?.refreshToken || isRefreshing) return;

    setIsRefreshing(true);
    setIsLoading(true);
    try {
      const response = await client.postApiUsersRefresh({
        refreshToken: tokens.refreshToken,
      });

      if (response.accessToken) {
        const newTokens: AuthTokens = {
          tokenType: response.tokenType!,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken!,
          expiresIn: response.expiresIn!,
        };
        storeTokens(newTokens);
        setTokens(newTokens);
      }
    } catch (error: unknown) {
      if (ApiException.isApiException(error)) {
        setError(error);
      } else {
        setError(
          new ApiException("Token refresh failed", 401, "Your session has expired. Please log in again.", {}, error)
        );
      }
      clearTokens();
      setTokens(null);
      setUser(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [client, tokens, isRefreshing]);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get access token function
  const getAccessToken = useCallback(() => {
    return tokens?.accessToken ?? null;
  }, [tokens]);

  // Check if current token is expired
  const checkTokenExpired = useCallback(() => {
    if (!tokens?.expiresIn) return true;
    return isTokenExpired(tokens.expiresIn);
  }, [tokens]);

  // Handle unauthorized events (401 responses)
  useEffect(() => {
    const handleUnauthorized = () => {
      if (!checkTokenExpired()) {
        refreshTokens();
      } else {
        clearTokens();
        setTokens(null);
        setUser(null);
      }
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [refreshTokens, checkTokenExpired]);

  // Auto refresh tokens before expiry
  useEffect(() => {
    if (!tokens?.accessToken || !tokens?.expiresIn) return;

    // Only set up refresh if token is not already expired
    if (isTokenExpired(tokens.expiresIn)) {
      refreshTokens();
      return;
    }

    // Calculate time until refresh (5 minutes before expiry)
    const timeUntilRefresh = tokens.expiresIn - Date.now() - TOKEN_REFRESH_THRESHOLD;

    // Only set up refresh if we're not too close to expiry
    if (timeUntilRefresh <= 0) {
      refreshTokens();
      return;
    }

    console.log(`Token refresh scheduled in ${timeUntilRefresh / 1000} seconds`);
    const refreshTimer = setTimeout(refreshTokens, timeUntilRefresh);
    return () => clearTimeout(refreshTimer);
  }, [tokens, refreshTokens]);

  // Fetch user info on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserInfo();
    }
  }, [isAuthenticated, fetchUserInfo]);

  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      error,
      tokens,
      user,
      login,
      logout,
      refreshTokens,
      clearError,
      getAccessToken,
      isTokenExpired: checkTokenExpired,
    }),
    [
      isAuthenticated,
      isLoading,
      error,
      tokens,
      user,
      login,
      logout,
      refreshTokens,
      clearError,
      getAccessToken,
      checkTokenExpired,
    ]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
