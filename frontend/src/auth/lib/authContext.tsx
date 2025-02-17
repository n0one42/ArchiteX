// frontend/src/auth/lib/authContext.tsx

"use client";

import { createContext, useContext } from "react";
import { ApiException, InfoResponse, LoginRequest } from "@/api/client";
import { getAuthTokens as getStoredTokens } from "./utils";
import { AuthTokens } from "./types";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: ApiException | null;
  tokens: AuthTokens | null;
  user: InfoResponse | null;
  login: (request: LoginRequest, options?: { useCookies?: boolean; useSessionCookies?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  clearError: () => void;
  getAccessToken: () => string | null;
  isTokenExpired: () => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Re-export getAuthTokens for backward compatibility
export const getAuthTokens = getStoredTokens;

// Custom hook for handling auth-protected routes
export function useAuthProtected() {
  const { isAuthenticated, isLoading } = useAuth();
  return { isAuthenticated, isLoading };
}
