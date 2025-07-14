import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel/serverless";
import tailwind from "@astrojs/tailwind";
import partytown from "@astrojs/partytown";

// https://astro.build/config
export default defineConfig({
  integrations: [
    mdx(), 
    react(), 
    tailwind(), 
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    })
  ],
  output: "server",
  adapter: vercel()
});