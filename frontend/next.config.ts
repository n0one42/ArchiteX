import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    // ignoreDuringBuilds: true,
  },
  /* config options here */
  // experimental: {
  // dynamicIO: true,
  // authInterrupts: true,
  // },
};

export default nextConfig;

// ? Notes
// Recommended rule-sets from the following ESLint plugins are all used within eslint-config-next:
// - eslint-plugin-react
// - eslint-plugin-react-hooks
// - eslint-plugin-next
// This will take precedence over the configuration from next.config.js.
