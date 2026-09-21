import { fileURLToPath, URL } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Frontend test runner configuration.
 *
 * The `test` script passes `--environment jsdom`; this file supplies the React
 * transform and the `@` / `declarations` aliases the app's own Vite config
 * defines, so component imports resolve exactly as they do in the app.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(new URL("../declarations", import.meta.url)),
      },
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
    dedupe: ["@icp-sdk/core"],
  },
  test: {
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    css: false,
    // The container sets thread-count environment variables that conflict with
    // Vitest's own defaults ("options.minThreads and options.maxThreads must
    // not conflict"). Pin a single fork so the run is deterministic and the
    // conflict cannot recur.
    pool: "forks",
    poolOptions: {
      forks: { minForks: 1, maxForks: 1 },
    },
  },
});
