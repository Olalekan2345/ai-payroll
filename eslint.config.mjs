import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Blockchain/wagmi libraries use `any` extensively in return types
      "@typescript-eslint/no-explicit-any": "off",
      // Effects are used for wagmi tx callbacks which is an accepted pattern
      "react-hooks/set-state-in-effect": "off",
      // Unused vars in imports are intentional stubs
      "@typescript-eslint/no-unused-vars": "warn",
      // Allow plain <a> tags in non-page files (e.g., error pages, external links)
      "@next/next/no-html-link-for-pages": "warn",
    },
  },
]);

export default eslintConfig;
