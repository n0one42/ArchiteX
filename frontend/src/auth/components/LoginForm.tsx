// frontend/src/auth/components/LoginForm.tsx

"use client";

import type { LoginRequest } from "@/api/client";
import type { FormEvent } from "react";

import { ApiException } from "@/api/client";
// import { toast } from "sonner";
import { useAuth } from "@/auth/lib/authContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Form schema matches LoginRequest interface
const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .regex(/[a-zA-Z0-9]/, { message: "Password must be alphanumeric" }),
  twoFactorCode: z.string().optional(),
  twoFactorRecoveryCode: z.string().optional(),
});

const testLoginRequest: LoginRequest = {
  email: "administrator@localhost" as string,
  password: "Administrator1!" as string,
};

// Derive the type from the schema
type LoginFormValues = z.infer<typeof formSchema>;

export default function LoginForm() {
  const { clearError, error, isLoading, login } = useAuth();
  const [errorState, setError] = useState<ApiException | null>(null);
  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(formSchema),
  });

  const handleCookieLogin = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      const loginRequest: LoginRequest = form.getValues();
      await login(loginRequest, { useCookies: true, useSessionCookies: false });
      // Redirect will be handled by middleware
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err);
      } else {
        setError(
          new ApiException(
            "An unexpected error occurred",
            500,
            err instanceof Error ? err.message : "Unknown error",
            {},
            null
          )
        );
      }
      console.error("Cookie Login Error:", err);
    }
  };

  const handleTestAccount = () => {
    if (testLoginRequest.email && testLoginRequest.password) {
      form.setValue("email", testLoginRequest.email);
      form.setValue("password", testLoginRequest.password);
    }
  };

  return (
    <div className="flex flex-col min-h-[50vh] h-full w-full items-center justify-center px-4">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your email and password to login to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-8">
              {(error || errorState) && (
                <div className="text-red-500 text-sm">{error?.message || errorState?.message}</div>
              )}
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete="email"
                          id="email"
                          placeholder="johndoe@mail.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <div className="flex justify-between items-center">
                        <FormLabel htmlFor="password">Password</FormLabel>
                        <Link
                          className="ml-auto inline-block text-sm underline"
                          href="#"
                        >
                          Forgot your password?
                        </Link>
                      </div>
                      <FormControl>
                        <PasswordInput
                          autoComplete="current-password"
                          id="password"
                          placeholder="******"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-2">
                  <Button
                    className="w-full"
                    disabled={isLoading}
                    onClick={handleCookieLogin}
                    variant="default"
                  >
                    {isLoading ? "Logging in..." : "Login with Cookie"}
                  </Button>
                  <Button
                    className="w-full"
                    onClick={handleTestAccount}
                    type="button"
                    variant="outline"
                  >
                    Use testing account
                  </Button>
                  <Button
                    className="w-full"
                    onClick={() => (window.location.href = "/debug")}
                    type="button"
                    variant="ghost"
                  >
                    Debug Mode
                  </Button>
                </div>
              </div>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link
              className="underline"
              href="/sign-up"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
