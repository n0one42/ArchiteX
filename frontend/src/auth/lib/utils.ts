// frontend/src/auth/lib/utils.ts

import { AuthTokens, TOKEN_REFRESH_THRESHOLD } from "./types";

// Store tokens in localStorage
export function storeTokens(tokens: AuthTokens): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
    localStorage.setItem("tokenType", tokens.tokenType);
    localStorage.setItem("expiresIn", tokens.expiresIn.toString());
  } catch (error) {
    console.error("Error storing tokens:", error);
    clearTokens();
  }
}

// Get tokens from localStorage
export function getAuthTokens(): AuthTokens | null {
  if (typeof window === "undefined") return null;

  try {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const tokenType = localStorage.getItem("tokenType");
    const expiresIn = localStorage.getItem("expiresIn");

    if (!accessToken || !refreshToken || !tokenType || !expiresIn) {
      return null;
    }

    return {
      accessToken,
      refreshToken,
      tokenType,
      expiresIn: parseInt(expiresIn),
    };
  } catch (error) {
    console.error("Error getting auth tokens:", error);
    clearTokens();
    return null;
  }
}

// Clear tokens from localStorage
export function clearTokens(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("tokenType");
  localStorage.removeItem("expiresIn");
}

// Check if token is expired
export function isTokenExpired(expirationTime: number): boolean {
  return Date.now() >= expirationTime;
}

// Check if token needs refresh
export function needsRefresh(expirationTime: number): boolean {
  const timeLeft = expirationTime - Date.now();
  return timeLeft <= TOKEN_REFRESH_THRESHOLD;
}
