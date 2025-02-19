"use client";

import { createContext, useContext } from "react";
import { ApiException, InfoResponse, LoginRequest } from "@/api/client";

interface AuthContextType {
  isLoading: boolean;
  error: ApiException | null;
  user: InfoResponse | null;
  login: (request: LoginRequest, options?: { useCookies?: boolean; useSessionCookies?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
