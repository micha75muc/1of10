import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["__tests__/**/*.test.ts"],
    setupFiles: ["__tests__/setup.ts"],
    coverage: {
      include: ["app/api/**", "lib/**"],
    },
  },
  resolve: {
    alias: {
      "@repo/db": path.resolve(__dirname, "../../packages/db/src"),
      "@repo/policy": path.resolve(__dirname, "../../packages/policy/src"),
    },
  },
});
