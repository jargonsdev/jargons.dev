/**
 * Incremental Vector Store (Qdrant) Update Script
 *
 * Updates the Qdrant vector store with only the changed dictionary words,
 * rather than re-seeding the entire collection.
 *
 * Usage:
 *   node dev/update-vector-store.js --upsert slug1,slug2 --delete slug3,slug4
 *
 * Flags:
 *   --upsert <slugs>  Comma-separated slugs to add or update in the vector store.
 *                      Fetches content from the live API, deletes old chunks for each
 *                      slug, then adds new chunks.
 *   --delete <slugs>  Comma-separated slugs to remove from the vector store.
 *
 * Required env vars:
 *   OPENAI_API_KEY, OPENAI_EMBEDDINGS_MODEL, QDRANT_URL, QDRANT_API_KEY
 */

import fetch from "node-fetch";
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { vectorStore } from "../apps/jai/index.js";

const PRODUCTION_API_BASE = "https://jargons.dev/api/v1/browse";

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = argv.slice(2);
  const upsertSlugs = [];
  const deleteSlugs = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--upsert") {
      if (!args[i + 1] || args[i + 1].startsWith("--")) {
        console.error(
          "❌ Error: --upsert flag requires a comma-separated list of slugs.",
        );
        console.error(
          "Usage: node dev/update-vector-store.js --upsert slug1,slug2 --delete slug3,slug4",
        );
        process.exit(1);
      }
      upsertSlugs.push(
        ...args[i + 1]
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      );
      i++;
    } else if (args[i] === "--delete") {
      if (!args[i + 1] || args[i + 1].startsWith("--")) {
        console.error(
          "❌ Error: --delete flag requires a comma-separated list of slugs.",
        );
        console.error(
          "Usage: node dev/update-vector-store.js --upsert slug1,slug2 --delete slug3,slug4",
        );
        process.exit(1);
      }
      deleteSlugs.push(
        ...args[i + 1]
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      );
      i++;
    } else {
      console.error(`❌ Error: Unknown argument "${args[i]}".`);
      console.error(
        "Usage: node dev/update-vector-store.js --upsert slug1,slug2 --delete slug3,slug4",
      );
      process.exit(1);
    }
  }

  return { upsertSlugs, deleteSlugs };
}

// ---------------------------------------------------------------------------
// Qdrant helpers
// ---------------------------------------------------------------------------

/**
 * Delete all existing vector points for a given word slug.
 * Uses a Qdrant payload filter on `metadata.slug`.
 */
async function deletePointsBySlug(slug) {
  await vectorStore.delete({
    filter: {
      must: [
        {
          key: "metadata.slug",
          match: { value: slug },
        },
      ],
    },
  });
}

/**
 * Fetch a single word's data from the production API.
 * Returns `{ slug, title, content }` or `null` if not found.
 */
async function fetchWord(slug) {
  const response = await fetch(`${PRODUCTION_API_BASE}/${slug}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(
      `Failed to fetch word "${slug}": ${response.status} ${response.statusText}`,
    );
  }
  return response.json();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const { upsertSlugs, deleteSlugs } = parseArgs(process.argv);

if (upsertSlugs.length === 0 && deleteSlugs.length === 0) {
  console.log("No slugs provided. Nothing to do.");
  console.log(
    "Usage: node dev/update-vector-store.js --upsert slug1,slug2 --delete slug3,slug4",
  );
  process.exit(0);
}

console.log("🚀 Starting incremental vector store update...");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

if (upsertSlugs.length > 0) {
  console.log(`📝 Words to upsert: ${upsertSlugs.join(", ")}`);
}
if (deleteSlugs.length > 0) {
  console.log(`🗑️  Words to delete: ${deleteSlugs.join(", ")}`);
}

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

let upsertedCount = 0;
let deletedCount = 0;
let failedCount = 0;

// ---- Handle upserts (add / update) ----------------------------------------

for (const slug of upsertSlugs) {
  try {
    console.log(`\n🔄 Processing upsert for "${slug}"...`);

    // 1. Fetch the latest content from the deployed site
    const word = await fetchWord(slug);
    if (!word) {
      console.warn(
        `   ⚠️  Word "${slug}" not found in production API, skipping without deleting existing vectors.`,
      );
      failedCount++;
      continue;
    }

    // 2. Create a LangChain Document with slug metadata
    const doc = new Document({
      pageContent: `${word.title}\n\n${word.content}`,
      metadata: { slug: word.slug },
    });

    // 3. Split into chunks (preserving metadata on each chunk)
    const chunks = await splitter.splitDocuments([doc]);
    console.log(`   Split into ${chunks.length} chunk(s).`);

    // 4. Remove any existing chunks for this word, now that new chunks are ready
    console.log(`   Deleting old chunks for "${slug}"...`);
    await deletePointsBySlug(slug);
    // 5. Add to vector store
    await vectorStore.addDocuments(chunks);
    console.log(`   ✅ Upserted "${slug}" (${chunks.length} chunks)`);
    upsertedCount++;
  } catch (error) {
    console.error(`   ❌ Failed to upsert "${slug}":`, error.message);
    failedCount++;
  }
}

// ---- Handle deletes --------------------------------------------------------

for (const slug of deleteSlugs) {
  try {
    console.log(`\n🗑️  Deleting "${slug}" from vector store...`);
    await deletePointsBySlug(slug);
    console.log(`   ✅ Deleted "${slug}"`);
    deletedCount++;
  } catch (error) {
    console.error(`   ❌ Failed to delete "${slug}":`, error.message);
    failedCount++;
  }
}

// ---- Summary ---------------------------------------------------------------

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(
  `✨ Done! Upserted: ${upsertedCount}, Deleted: ${deletedCount}, Failed: ${failedCount}`,
);

if (failedCount > 0) {
  console.error("💥 Some operations failed. Check the logs above.");
  process.exit(1);
}

console.log("🎉 Vector store update completed successfully!");
process.exit(0);
