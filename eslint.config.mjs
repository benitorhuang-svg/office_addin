import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import officeAddins from "eslint-plugin-office-addins";

export default tseslint.config(
  // ─── Ignore patterns ──────────────────────────────────
  {
    ignores: [
      "dist/**",
      "dist-server/**",
      "node_modules/**",
      "webpack.config.js",
      "**/*.docx",
    ],
  },

  // ─── JavaScript / MJS / CJS scripts configuration ─────
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    languageOptions: {
      ecmaVersion: 2025,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.commonjs, // Important for .cjs
      },
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "no-empty": ["error", { allowEmptyCatch: true }],
    },
  },

  // ─── Base JS recommended rules ────────────────────────
  js.configs.recommended,

  // ─── TypeScript recommended (only for TS files) ───────
  ...tseslint.configs.recommended.map((config) => ({ ...config, files: ["**/*.ts", "**/*.tsx"] })),

  // ─── Global settings for all TS files ─────────────────
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      ecmaVersion: 2025,
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
    files: ["backend/**/*.ts"],
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
    files: ["client/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  }
);
