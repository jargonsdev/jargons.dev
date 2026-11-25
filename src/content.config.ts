import path from "node:path";
import { pathToFileURL } from "node:url";
import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const contentRepositoryPath = path.resolve(".content");

const dictionary = defineCollection({
  loader: glob({
    pattern: "**/*.mdx",
    base: pathToFileURL(
      path.join(contentRepositoryPath, "dictionary") + path.sep,
    ).href,
  }),
});

const articles = defineCollection({
  loader: glob({
    pattern: "articles/*.mdx",
    base: pathToFileURL(contentRepositoryPath + path.sep).href,
    generateId: ({ entry }) => path.posix.basename(entry, ".mdx"),
  }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    publishedAt: z.coerce.date(),
    author: z
      .object({
        name: z.string().min(1).optional(),
        github: z
          .string()
          .regex(/^[a-zA-Z0-9-]+$/)
          .optional(),
        url: z
          .string()
          .url()
          .refine((value) => /^https?:\/\//i.test(value))
          .optional(),
      })
      .refine((author) => author.name || author.github),
    cover: z.object({
      url: z
        .string()
        .url()
        .refine((value) => /^https?:\/\//i.test(value)),
      alt: z.string().min(1),
    }),
    tags: z.array(z.string()).default([]),
    relatedWords: z.array(z.string()).default([]),
  }),
});

export const collections = { dictionary, articles };
