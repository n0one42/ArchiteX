// frontend/src/auth/lib/types.ts

// Constants
export const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

// Re-export the type from the API client
import { AccessTokenResponse } from "@/api/client";
export type AuthTokens = Required<AccessTokenResponse>;
