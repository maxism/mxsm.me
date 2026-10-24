import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default defineConfig([
  globalIgnores([".next/**", "src/signal/**", "public/**"]),
  ...nextVitals,
  ...nextTs,
  eslintConfigPrettier,
  {
    // React Compiler rules from eslint-config-next 16; existing effects predate them.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
    },
  },
]);
