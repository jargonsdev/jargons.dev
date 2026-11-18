import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import partytown from "@astrojs/partytown";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

const VERCEL_PREVIEW_SITE =
  process.env.VERCEL_ENV === "preview" && process.env.VERCEL_BRANCH_URL
    ? `https://${process.env.VERCEL_BRANCH_URL}`
    : undefined;

const site = VERCEL_PREVIEW_SITE || "https://www.jargons.dev";

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [
    mdx(),
    react(),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
  ],
  vite: {
    css: {
      postcss: {
        plugins: [tailwindcss(), autoprefixer()],
      },
    },
  },
  compressHTML: true,
  output: "server",
  adapter: vercel(),
});
