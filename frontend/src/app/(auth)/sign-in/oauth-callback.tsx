// pages/oauth-callback.tsx
import React, { useEffect } from "react";

const OAuthCallback: React.FC = () => {
  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage(
        {
          data: { linkingUrl: window.location.href },
          type: "oauth_callback",
        },
        window.location.origin // Only accept messages from our own origin
      );
      window.close();
    }
  }, []);

  return <div>Processing login...</div>;
};

export default OAuthCallback;
