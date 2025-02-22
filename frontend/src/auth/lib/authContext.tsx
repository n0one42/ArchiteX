"use client";

import type { ApiException, InfoResponse, LoginRequest } from "@/api/client";

import { createContext, useContext } from "react";

interface AuthContextType {
  clearError: () => void;
  error: ApiException | null;
  isLoading: boolean;

  login: (request: LoginRequest, options?: { useCookies?: boolean; useSessionCookies?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  user: InfoResponse | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
