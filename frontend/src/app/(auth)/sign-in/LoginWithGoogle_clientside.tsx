// components/LoginWithGoogle.tsx
import React from "react";
import { OAuthPopup } from "@/lib/oauthPopup_clientside";
import { generateRandomString, pkceChallengeFromVerifier } from "@/lib/utils";

const LoginWithGoogle: React.FC = () => {
  const handleLogin = async () => {
    try {
      // Generate PKCE code verifier and challenge
      const codeVerifier = generateRandomString(128);
      const codeChallenge = await pkceChallengeFromVerifier(codeVerifier);
      // Generate a random state for CSRF protection
      const state = generateRandomString(16);

      // Store verifier and state in sessionStorage for later retrieval
      sessionStorage.setItem("pkce_code_verifier", codeVerifier);
      sessionStorage.setItem("oauth_state", state);

      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
      const scope = "openid profile email";

      // Build the Google OAuth URL with PKCE parameters
      const params = new URLSearchParams({
        client_id: clientId || "",
        redirect_uri: redirectUri || "",
        response_type: "code",
        scope,
        state,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
      });
      const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

      // Open the OAuth popup using our utility
      const popup = new OAuthPopup();
      const result = await popup.open(googleOAuthUrl, { center: true });
      if (!result.linkingUrl) {
        console.error("No linkingUrl returned from OAuth popup.");
        return;
      }

      // Parse the returned URL to extract code and state
      const url = new URL(result.linkingUrl);
      const code = url.searchParams.get("code");
      const returnedState = url.searchParams.get("state");

      if (!code || !returnedState) {
        console.error("Missing code or state in the callback URL.");
        return;
      }

      // Verify state to prevent CSRF attacks
      const storedState = sessionStorage.getItem("oauth_state");
      if (returnedState !== storedState) {
        console.error("State parameter mismatch. Possible CSRF attack.");
        return;
      }

      // Retrieve the stored PKCE code verifier
      const storedCodeVerifier = sessionStorage.getItem("pkce_code_verifier");
      if (!storedCodeVerifier) {
        console.error("Missing PKCE code verifier.");
        return;
      }

      // Exchange the authorization code with your backend
      const response = await fetch("/api/auth/exchange-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          code_verifier: storedCodeVerifier,
          state: returnedState,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Backend exchange failed:", text);
        return;
      }

      const data = await response.json();
      console.log("User signed in successfully:", data);
      // TODO: Update your authentication state (e.g. via context or redirect)
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
