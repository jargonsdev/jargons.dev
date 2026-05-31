import fetch from "node-fetch";
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { vectorStore } from "../apps/jai/index.js";

// Load the dictionary from the jargons.dev API
const response = await fetch("https://jargons.dev/api/v1/browse");
const dictionary = await response.json();
console.log(`Fetched ${dictionary.length} words from the API`);

// Create LangChain Documents with slug metadata
const docs = dictionary.map(
  (word) =>
    new Document({
      pageContent: `${word.title}\n\n${word.content}`,
      metadata: { slug: word.slug },
    }),
);
console.log(`Created ${docs.length} documents`);

// Initialize the splitter
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

// Split the documents
const allSplits = await splitter.splitDocuments(docs);
console.log(`Split into ${allSplits.length} chunks`);

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