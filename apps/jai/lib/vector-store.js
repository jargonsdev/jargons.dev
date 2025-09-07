/**
 * @todo Nice to have: Setup vectorStore for local development and production, and use based on the environment
 * @todo ...use `MemoryVectorStore` for local development and `QdrantVectorStore` for production
 */

import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";

// Initialize the OpenAI embeddings
const embeddings = new OpenAIEmbeddings({
  model:
    process.env.OPENAI_EMBEDDINGS_MODEL ||
    import.meta.env.OPENAI_EMBEDDINGS_MODEL,
  apiKey: process.env.OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY,
});

// Load vector store collection
const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
  url: process.env.QDRANT_URL || import.meta.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY || import.meta.env.QDRANT_API_KEY,
  collectionName: "dictionary",
});

export { vectorStore as default };
