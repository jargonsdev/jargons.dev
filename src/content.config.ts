import path from "node:path";
import { pathToFileURL } from "node:url";
import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";

const contentRepositoryPath = path.resolve(".content", "dictionary");

const dictionary = defineCollection({
  loader: glob({
    pattern: "**/*.mdx",
    base: pathToFileURL(contentRepositoryPath + path.sep).href,
  }),
});

export const collections = { dictionary };
