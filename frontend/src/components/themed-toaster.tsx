"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sonner";

export function ThemedToaster() {
  const { theme } = useTheme();

  return (
    <Toaster
      richColors
      theme={theme as "dark" | "light" | "system"}
    />
  );
}
