import { AccessTokenResponse, InfoResponse, RegisterRequest, LoginRequest, TwoFactorResponse } from "../api/client";
import { http, HttpResponse } from "msw";

// Mock handlers for demo users
export const demoUserHandlers = [
  // User Registration
  http.post("*/api/Users/register", async ({ request }) => {
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
  http.post("*/api/Users/login", async ({ request }) => {
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
  http.post("*/api/Users/manage/2fa", () => {
    return HttpResponse.json(demoTwoFactorResponse);
  }),

  // Token Refresh
  http.post("*/api/Users/refresh", () => {
    return HttpResponse.json(demoAccessTokenResponse);
  }),
];

// ------------------------------------------------------------------------------------------------

// Demo user data
export const demoUsers = [
  {
    email: "john.doe@example.com",
    password: "Password123!",
    isEmailConfirmed: true,
  },
  {
    email: "jane.smith@example.com",
    password: "Password456!",
    isEmailConfirmed: false,
  },
];

// Mock responses
export const demoAccessTokenResponse: AccessTokenResponse = {
  tokenType: "Bearer",
  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  expiresIn: 3600,
  refreshToken: "refresh_token_example",
};

// Create demo info response with default user
const defaultUser = demoUsers[0];
export const demoInfoResponse: InfoResponse = {
  email: defaultUser ? defaultUser.email : "",
  isEmailConfirmed: defaultUser ? defaultUser.isEmailConfirmed : false,
};

export const demoTwoFactorResponse: TwoFactorResponse = {
  sharedKey: "ABCDEFGHIJKLMNOP",
  recoveryCodesLeft: 10,
  recoveryCodes: ["CODE1-XXXXX", "CODE2-XXXXX", "CODE3-XXXXX"],
  isTwoFactorEnabled: true,
  isMachineRemembered: false,
};

// Helper functions for mock handlers
export const findDemoUser = (email: string) => demoUsers.find((user) => user.email === email);

export const validateDemoLogin = (login: LoginRequest) => {
  const user = findDemoUser(login.email!);
  return user && user.password === login.password;
};

export const validateDemoRegistration = (registration: RegisterRequest) => {
  return !findDemoUser(registration.email!);
};
