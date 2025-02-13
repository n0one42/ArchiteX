import { AccessTokenResponse, InfoResponse, RegisterRequest, LoginRequest, TwoFactorResponse } from "../api/client";
import { http, HttpResponse } from "msw";

// Demo user data
export const users = [
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
const defaultUser = users[0];
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

// Error response type matching the API
interface ErrorResponse {
  type: string;
  title: string;
  status: number;
  detail: string;
}

// Standard error responses
const unauthorizedError: ErrorResponse = {
  type: "https://tools.ietf.org/html/rfc9110#section-15.5.2",
  title: "Unauthorized",
  status: 401,
  detail: "Failed",
};

const invalidCredentialsError: ErrorResponse = {
  type: "https://tools.ietf.org/html/rfc9110#section-15.5.2",
  title: "Invalid Credentials",
  status: 401,
  detail: "The provided credentials are incorrect",
};

const emailNotConfirmedError: ErrorResponse = {
  type: "https://tools.ietf.org/html/rfc9110#section-15.5.2",
  title: "Email Not Confirmed",
  status: 401,
  detail: "Please confirm your email before logging in",
};

// Helper functions for mock handlers
export const finduser = (email: string) => users.find((user) => user.email === email);

export const validateDemoLogin = (login: LoginRequest): { isValid: boolean; error?: ErrorResponse } => {
  const user = finduser(login.email!);

  if (!user) {
    return {
      isValid: false,
      error: invalidCredentialsError,
    };
  }

  if (!user.isEmailConfirmed) {
    return {
      isValid: false,
      error: emailNotConfirmedError,
    };
  }

  if (user.password !== login.password) {
    return {
      isValid: false,
      error: invalidCredentialsError,
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
        type: "https://tools.ietf.org/html/rfc9110#section-15.5.4",
        title: "Email Already Exists",
        status: 400,
        detail: "An account with this email already exists",
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
