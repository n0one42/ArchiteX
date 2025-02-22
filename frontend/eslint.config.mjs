import { FlatCompat } from "@eslint/eslintrc";
import boundaries from "eslint-plugin-boundaries";
import perfectionist from "eslint-plugin-perfectionist";
import prettier from "eslint-plugin-prettier";
import { dirname } from "path";
import { fileURLToPath } from "url";

import prettierConfig from "./prettier.config.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Next.js / TypeScript + Prettier base config via FlatCompat
const baseConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    rules: {
      // typescript
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-empty-object-type": "error",
      "@typescript-eslint/no-explicit-any": "error",
      // "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/no-unused-vars": ["error", { args: "none" }],
      // common
      "consistent-return": "error",
      "default-case-last": "error",
      "func-names": "warn",
      "no-constant-condition": "error",
      "no-useless-rename": "error",
      "prefer-arrow-callback": "error",
      "prefer-template": "error",
    },
  },
];

// Prettier integration: Run Prettier as an ESLint rule and apply your prettierConfig
const prettierIntegration = {
  plugins: {
    prettier,
  },
  rules: {
    "prettier/prettier": ["error", prettierConfig],
  },
};

// Custom boundaries config from your old .eslintrc.json
const boundariesConfig = {
  plugins: {
    boundaries,
  },
  rules: {
    ...boundaries.configs.recommended.rules,
    "boundaries/element-types": [
      "error",
      {
        default: "disallow",
        rules: [
          {
            allow: ["shared"],
            from: ["shared"],
          },
          {
            allow: ["routes", "auth"],
            from: ["routes", "auth", "feature"],
          },
          {
            allow: ["shared", "auth", "api", ["feature", { featureName: "${from.featureName}" }]],
            from: ["feature"],
          },
          {
            allow: ["api"],
            from: ["api"],
          },
          {
            allow: ["auth", "shared", "api", ["feature", { featureName: "${from.featureName}" }]],
            from: ["auth"],
          },
          {
            allow: ["api", "mocks"],
            from: ["mocks"],
          },
          {
            allow: ["shared", "feature", "auth"],
            from: ["app", "neverImport"],
          },
          {
            allow: ["app", "css"],
            from: ["app"],
          },
        ],
      },
    ],
    "boundaries/no-private": "off",
    "boundaries/no-unknown": "warn",
    "boundaries/no-unknown-files": "warn",
  },
  settings: {
    "boundaries/elements": [
      {
        capture: ["api"],
        mode: "full",
        pattern: ["src/api/**/*"],
        type: "api",
      },
      {
        capture: ["_", "fileName"],
        mode: "full",
        pattern: ["src/app/**/*"],
        type: "app",
      },
      {
        capture: ["auth"],
        mode: "full",
        pattern: ["src/auth/**/*"],
        type: "auth",
      },
      {
        capture: ["featureName"],
        mode: "full",
        pattern: ["src/features/*/**/*"],
        type: "feature",
      },
      {
        capture: ["mocks"],
        mode: "full",
        pattern: ["src/mocks/**/*"],
        type: "mocks",
      },
      {
        capture: ["routes"],
        mode: "full",
        pattern: ["src/routes/**/*"],
        type: "routes",
      },
      {
        mode: "full",
        pattern: ["src/components/**/*", "src/hooks/**/*", "src/lib/**/*"],
        type: "shared",
      },
      {
        mode: "full",
        pattern: ["src/*", "src/tasks/**/*"],
        type: "neverImport",
      },

      {
        mode: "full",
        pattern: ["**/*.css"],
        type: "css",
      },
    ],
    "boundaries/include": ["src/**/*"],
  },
};

const perfectionistConfig = {
  plugins: {
    perfectionist,
  },
  rules: {
    ...perfectionist.configs["recommended-natural"].rules,
  },
};
const config = [...baseConfig, perfectionistConfig, boundariesConfig, prettierIntegration];

export default config;
