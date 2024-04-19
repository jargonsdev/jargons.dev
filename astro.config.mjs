import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), mdx(), react()],
  output: "server",
  adapter: vercel({
    includeFiles: ["./src/pages/open-graph/_IBMPlexMono-SemiBold.ttf"]
  })
});