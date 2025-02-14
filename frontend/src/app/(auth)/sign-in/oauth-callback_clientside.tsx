// src/app/(auth)/sign-in/oauth-callback.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";

const OAuthCallback: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const { provider, token, requestId } = router.query;
    if (provider && token && requestId) {
      window.opener?.postMessage(
        {
          type: "oauth_callback",
          data: { provider, token, requestId },
        },
        window.location.origin
      );
      window.close();
    }
  }, [router.query]);

  return <div>Processing login...</div>;
};

export default OAuthCallback;
