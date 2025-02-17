import { Client } from "./client";

if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL environment variable is not set");
}

// Custom fetch handler that adds auth token
const customFetch = async (url: RequestInfo, init?: RequestInit): Promise<Response> => {
  // Get the current access token from localStorage
  const accessToken = localStorage.getItem("accessToken");
  const tokenType = localStorage.getItem("tokenType");

  // Clone the headers to avoid modifying the original
  const headers = new Headers(init?.headers || {});

  // Add auth header if we have a token
  if (accessToken && tokenType) {
    headers.set("Authorization", `${tokenType} ${accessToken}`);
  }

  // Create new init object with updated headers
  const updatedInit: RequestInit = {
    ...init,
    credentials: "include", // ensures HttpOnly cookies are sent
    headers,
  };

  // Make the request
  const response = await fetch(url, updatedInit);

  // Handle 401 Unauthorized responses
  if (response.status === 401) {
    // Dispatch an event that the auth provider can listen to
    window.dispatchEvent(new Event("auth:unauthorized"));
  }

  return response;
};

// Create API client with custom fetch handler
const apiClient = new Client(process.env.NEXT_PUBLIC_API_BASE_URL, {
  fetch: customFetch,
});

export default apiClient;
