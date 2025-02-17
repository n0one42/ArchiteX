// src/app/(auth)/sign-in/LoginWithGoogle.tsx
import React from "react";
import { PopupWindow } from "@/lib/popupWindow";

const LoginWithGoogle: React.FC = () => {
  const handleLogin = async () => {
    try {
      // Set your frontend callback URL (adjust the path if needed)
      const callbackUrl = `${window.location.origin}/auth/sign-in/oauth-callback`;
      // Construct the backend URL for Google sign-in
      const authUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/Users/sign-in/google?callbackUrl=${encodeURIComponent(callbackUrl)}`;

      const popup = new PopupWindow();
      const result = await popup.open(authUrl, { center: true });

      if (!result.token) {
        console.error("No token received from popup.");
        return;
      }

      // Complete the sign-in by calling the backend with the token
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/Users/sign-in/google/${result.token}`, {
        method: "POST",
        credentials: "include", // ensures HttpOnly cookies are sent
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      const data = await response.json();
      console.log("User signed in successfully:", data);
      // Here you can update your authentication state (e.g. store tokens, update context, redirect)
    } catch (error) {
      console.error("Error during login with Google:", error);
    }
  };

  return (
    <button
      className="btn"
      onClick={handleLogin}
    >
      Login with Google
    </button>
  );
};

export default LoginWithGoogle;
