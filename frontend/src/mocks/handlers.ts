import { http, HttpResponse } from "msw";
import { LoginRequest, RegisterRequest } from "../api/client";
import {
  demoAccessTokenResponse,
  demoInfoResponse,
  demoTwoFactorResponse,
  validateDemoLogin,
  validateDemoRegistration,
} from "./demoUsers";

export const handlers = [
  // User Registration
  http.post("/api/Users/register", async ({ request }) => {
    const registration = (await request.json()) as RegisterRequest;
    if (validateDemoRegistration(registration)) {
      return new HttpResponse(null, { status: 200 });
    }
    return new HttpResponse(null, {
      status: 400,
      statusText: "Email already exists",
    });
  }),

  // User Login
  http.post("/api/Users/login", async ({ request }) => {
    const login = (await request.json()) as LoginRequest;
    if (validateDemoLogin(login)) {
      return HttpResponse.json(demoAccessTokenResponse);
    }
    return new HttpResponse(null, {
      status: 400,
      statusText: "Invalid credentials",
    });
  }),

  // Get User Info
  http.get("*/api/Users/manage/info", () => {
    return HttpResponse.json(demoInfoResponse);
  }),

  // Two Factor Authentication
  http.post("/api/Users/manage/2fa", () => {
    return HttpResponse.json(demoTwoFactorResponse);
  }),

  // Token Refresh
  http.post("/api/Users/refresh", () => {
    return HttpResponse.json(demoAccessTokenResponse);
  }),
];
