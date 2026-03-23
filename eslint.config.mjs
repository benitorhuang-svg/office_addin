import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import officeAddins from "eslint-plugin-office-addins";

export default tseslint.config(
  // ─── Ignore patterns ──────────────────────────────────
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "*.js",
      "*.mjs",
      "scripts/**",
      "server/examples/**",
      "webpack.config.js",
      "server/tests/**",
    ],
  },

  // ─── Base JS recommended rules ────────────────────────
  js.configs.recommended,

  // ─── TypeScript recommended (type-checked) ────────────
  ...tseslint.configs.recommended,

  // ─── Global settings for all TS files ─────────────────
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    plugins: {
      "office-addins": officeAddins,
    },
    rules: {
      ...officeAddins.configs.recommended.rules,
      // Relax rules that would create excessive noise
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-empty-function": "off",
      "no-undef": "off", // TypeScript handles this
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-useless-catch": "warn",
      "prefer-const": "warn",
    },
  },

  // ─── Server-specific overrides ────────────────────────
  {
    files: ["server/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Show server-side explicit-any and unused-vars warnings
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },

  // ─── Frontend-specific overrides ──────────────────────
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  }
);
