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
      "@typescript-eslint/no-unused-vars": ["warn", { args: "none" }],
      // common
      "consistent-return": "error",
      "default-case-last": "error",
      "func-names": "warn",
      "no-constant-condition": "error",
      "no-unused-vars": "error",
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
    ...perfectionist.configs["recommended-natural"].rules,
    // ...boundaries.configs.recommended.rules, // TODO: Uncomment at the end of the migration
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
            allow: ["shared", ["feature", { featureName: "${from.featureName}" }]],
            from: ["feature"],
          },
          {
            allow: ["shared", "feature"],
            from: ["app", "neverImport"],
          },
          {
            allow: ["app", "css"],
            from: ["app"],
          },
        ],
      },
    ],
    "boundaries/no-unknown": "warn",
    "boundaries/no-unknown-files": "warn",
  },
  settings: {
    "boundaries/elements": [
      {
        mode: "full",
        pattern: ["src/components/**/*", "src/hooks/**/*", "src/lib/**/*"],
        type: "shared",
      },
      {
        capture: ["featureName"],
        mode: "full",
        pattern: ["src/features/*/**/*"],
        type: "feature",
      },
      {
        capture: ["_", "fileName"],
        mode: "full",
        pattern: ["src/app/**/*"],
        type: "app",
      },
      {
        mode: "full",
        pattern: ["src/*", "src/tasks/**/*"],
        type: "neverImport",
      },
      {
        mode: "full",
        pattern: ["auth/lib/**/*"],
        type: "auth",
      },
      {
        mode: "full",
        pattern: ["**/*.css"],
        type: "css",
      },
    ],
    // "boundaries/include": ["src/**/*", "!src/mocks/**/*"],
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
const config = [...baseConfig, perfectionistConfig, prettierIntegration]; // TODO: add boundariesConfig after migration

export default config;
