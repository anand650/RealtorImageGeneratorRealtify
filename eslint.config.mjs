import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Test files
    "**/__tests__/**",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "jest.setup.ts",
    "jest.config.js",
    // Scripts
    "scripts/**",
    // Config files
    "tailwind.config.js",
    "postcss.config.mjs",
    "amplify.yml",
    "*.tsbuildinfo",
  ]),
]);

export default eslintConfig;
