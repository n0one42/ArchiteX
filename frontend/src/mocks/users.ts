import { http, HttpResponse } from "msw";

import type {
  AccessTokenResponse,
  InfoResponse,
  LoginRequest,
  RegisterRequest,
  TwoFactorResponse,
} from "../api/client";

// Demo user data
export const users = [
  {
    email: "john.doe@example.com",
    isEmailConfirmed: true,
    password: "Password123!",
  },
  {
    email: "jane.smith@example.com",
    isEmailConfirmed: false,
    password: "Password456!",
  },
];

// Mock responses
export const demoAccessTokenResponse: AccessTokenResponse = {
  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  expiresIn: 3600,
  refreshToken: "refresh_token_example",
  tokenType: "Bearer",
};

// Create demo info response with default user
const defaultUser = users[0];
export const demoInfoResponse: InfoResponse = {
  email: defaultUser ? defaultUser.email : "",
  isEmailConfirmed: defaultUser ? defaultUser.isEmailConfirmed : false,
};

export const demoTwoFactorResponse: TwoFactorResponse = {
  isMachineRemembered: false,
  isTwoFactorEnabled: true,
  recoveryCodes: ["CODE1-XXXXX", "CODE2-XXXXX", "CODE3-XXXXX"],
  recoveryCodesLeft: 10,
  sharedKey: "ABCDEFGHIJKLMNOP",
};

// Error response type matching the API
interface ErrorResponse {
  detail: string;
  status: number;
  title: string;
  type: string;
}

// Standard error responses
const unauthorizedError: ErrorResponse = {
  detail: "Failed",
  status: 401,
  title: "Unauthorized",
  type: "https://tools.ietf.org/html/rfc9110#section-15.5.2",
};

const invalidCredentialsError: ErrorResponse = {
  detail: "The provided credentials are incorrect",
  status: 401,
  title: "Invalid Credentials",
  type: "https://tools.ietf.org/html/rfc9110#section-15.5.2",
};

const emailNotConfirmedError: ErrorResponse = {
  detail: "Please confirm your email before logging in",
  status: 401,
  title: "Email Not Confirmed",
  type: "https://tools.ietf.org/html/rfc9110#section-15.5.2",
};

// Helper functions for mock handlers
export const finduser = (email: string) => users.find((user) => user.email === email);

export const validateDemoLogin = (login: LoginRequest): { error?: ErrorResponse; isValid: boolean } => {
  const user = finduser(login.email!);

  if (!user) {
    return {
      error: invalidCredentialsError,
      isValid: false,
    };
  }

  if (!user.isEmailConfirmed) {
    return {
      error: emailNotConfirmedError,
      isValid: false,
    };
  }

  if (user.password !== login.password) {
    return {
      error: invalidCredentialsError,
      isValid: false,
    };
  }

  return { isValid: true };
};

export const validateDemoRegistration = (registration: RegisterRequest) => {
  return !finduser(registration.email!);
};

// Mock handlers for demo users
export const userHandlers = [
  // User Registration
  http.post("*/api/Users/register", async ({ request }) => {
    const registration = (await request.json()) as RegisterRequest;
    if (validateDemoRegistration(registration)) {
      return new HttpResponse(null, { status: 200 });
    }
    return HttpResponse.json(
      {
        detail: "An account with this email already exists",
        status: 400,
        title: "Email Already Exists",
        type: "https://tools.ietf.org/html/rfc9110#section-15.5.4",
      },
      { status: 400 }
    );
  }),

  // User Login
  http.post("*/api/Users/login", async ({ request }) => {
    const login = (await request.json()) as LoginRequest;
    const validationResult = validateDemoLogin(login);

    if (validationResult.isValid) {
      return HttpResponse.json(demoAccessTokenResponse);
    }

    return HttpResponse.json(validationResult.error || unauthorizedError, {
      status: validationResult.error?.status || 401,
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
