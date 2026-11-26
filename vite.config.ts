import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

// Where spring-iam runs. The app server proxies /api/** there (in dev and in
// the built server), so the IAM's cookies stay first-party to this origin.
// Read at build time: set IAM_URL when running `bun run build`.
const iamUrl = process.env.IAM_URL ?? "http://localhost:8080";

export default defineConfig({
  server: { port: 3000 },
  plugins: [
    tsConfigPaths(),
    // src/server.ts wraps the SSR entry with a plain HTML error page.
    tanstackStart({ server: { entry: "server" } }),
    nitro({ routeRules: { "/api/**": { proxy: `${iamUrl}/api/**` } } }),
    viteReact(),
    tailwindcss(),
  ],
});
