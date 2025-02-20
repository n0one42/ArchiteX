import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a random string using the specified charset.
 */
export function generateRandomString(length: number): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

/**
 * Creates a SHA-256 code challenge from the given verifier.
 */
export async function pkceChallengeFromVerifier(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  const base64String = btoa(String.fromCharCode(...new Uint8Array(digest)));
  // Convert Base64 to URL-safe Base64
  return base64String.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
