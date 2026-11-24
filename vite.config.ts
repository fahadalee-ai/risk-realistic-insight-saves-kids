import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Root path is what Vercel serves. Nitro's vercel preset emits the
// Build Output API that `vercel build` deploys.
export default defineConfig({
  nitro: { preset: "vercel" },
  vite: {
    base: "/",
  },
});
