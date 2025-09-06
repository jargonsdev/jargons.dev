import fetch from "node-fetch";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { vectorStore } from "../apps/jai/index.js";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// Load the dictionary from the jargons.dev API
const response = await fetch("https://jargons.dev/api/v1/browse");
const dictionary = await response.json();

// Save the dictionary to the file system
const path = join(dirname(fileURLToPath(import.meta.url)), "dictionary.json");
await fs.writeFile(path, JSON.stringify(dictionary, null, 2));
console.log(`Saved the dictionary file to ${path}`);

// Load the dictionary from the file system
const loader = new JSONLoader("dev/dictionary.json", ["/title", "/content"]);

// Load the documents
const docs = await loader.load();
console.log(`Loaded ${docs.length} documents`);

// Initialize the splitter
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

// Split the documents
const allSplits = await splitter.splitDocuments(docs);
console.log(`Split ${allSplits.length} documents`);

// Add the splits to the vector store in batches
const batchSize = 100;
for (let i = 0; i < allSplits.length; i += batchSize) {
  const batch = allSplits.slice(i, i + batchSize);
  await vectorStore.addDocuments(batch);
  const batchNum = Math.floor(i / batchSize) + 1;
  const totalBatches = Math.ceil(allSplits.length / batchSize);
  console.log(
    `Added batch ${batchNum} of ${totalBatches} (${batch.length} documents) to the vector store`,
  );
}
console.log(`Added ${allSplits.length} splits to the vector store`);

// Clean up
await fs.rm(path);
console.log(`Cleaned up the dictionary file at ${path}`);