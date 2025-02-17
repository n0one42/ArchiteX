// frontend/src/auth/lib/utils.ts

/**
 * Auth Token Storage Utilities
 *
 * This module handles the persistence layer for auth tokens, separating storage concerns
 * from the main authentication state management in authProvider.
 *
 * While these utilities are currently only used by authProvider, keeping them separate:
 * 1. Maintains clear separation between storage and state management
 * 2. Improves testability of storage operations
 * 3. Keeps the authProvider focused on state management
 */

// Re-export the type from the API client
import { AccessTokenResponse } from "@/api/client";

// Store tokens in localStorage
export function storeTokens(tokens: AccessTokenResponse): void {
  if (typeof window === "undefined") return;

  try {
    // We know these values exist from the backend
    localStorage.setItem("accessToken", tokens.accessToken!);
    localStorage.setItem("refreshToken", tokens.refreshToken!);
    localStorage.setItem("tokenType", tokens.tokenType!);
    localStorage.setItem("expiresIn", tokens.expiresIn!.toString());
  } catch (error) {
    console.error("Error storing tokens:", error);
    clearTokens();
  }
}

// Get tokens from localStorage
export function getAuthTokens(): AccessTokenResponse | null {
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
