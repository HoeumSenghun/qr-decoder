import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const config = {
  ...defineCloudflareConfig(),
  // OpenNext would normally run `npm run build`. That script is the Cloudflare
  // Worker build, so we point it at Next.js directly to avoid recursion.
  buildCommand: "npm run build:next",
};

export default config;
