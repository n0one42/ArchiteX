"use client";

import { AuthContext } from "@/auth/lib/authContext";
import { useContext } from "react";

// ----------------------------------------------------------------------

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext: Context must be used inside AuthProvider");
  }

  return context;
}
