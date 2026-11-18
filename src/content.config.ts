import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const dictionary = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/dictionary" }),
});

export const collections = { dictionary };
