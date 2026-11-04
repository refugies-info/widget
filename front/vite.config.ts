import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ command, mode }) => {
  const { VITE_SITE_URL } = loadEnv(mode, process.cwd(), "VITE_");
  if (command === "build" && !URL.canParse(VITE_SITE_URL ?? "")) {
    throw new Error("VITE_SITE_URL must be set to the URL of the site, e.g. https://refugies.info");
  }

  return {
    plugins: [svelte()],
    build: {
      // Keep the flags as files instead of inlining each of them in the bundle
      assetsInlineLimit: 0,
    },
    server: {
      proxy: { "/widgets": "http://localhost:3001" },
    },
  };
});
