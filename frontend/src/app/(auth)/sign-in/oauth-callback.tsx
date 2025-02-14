// pages/oauth-callback.tsx
import React, { useEffect } from "react";

const OAuthCallback: React.FC = () => {
  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage(
        {
          type: "oauth_callback",
          data: { linkingUrl: window.location.href },
        },
        window.location.origin // Only accept messages from our own origin
      );
      window.close();
    }
  }, []);

  return <div>Processing login...</div>;
};

export default OAuthCallback;
