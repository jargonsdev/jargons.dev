/**
 * Vector Store (Qdrant) Cluster Ping Utility
 *
 * This script performs a lightweight health check on the Vector Store (Qdrant) cluster
 * by checking the existence of the 'dictionary' collection.
 * 
 * This keeps the cluster active and prevents automatic deletion due to inactivity.
 */
const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY
const COLLECTION_NAME = "dictionary";

console.log("🚀 Starting Vector Store (Qdrant) cluster ping...");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

try {
  console.log("🔍 Checking Vector Store (Qdrant) cluster connectivity...");
  
  // Test basic cluster connection
  const healthResponse = await fetch(QDRANT_URL, {
    headers: {
      'api-key': QDRANT_API_KEY
    }
  });
  
  if (!healthResponse.ok) {
    throw new Error(`Health check failed: ${healthResponse.status} ${healthResponse.statusText}`);
  }
  
  console.log("✅ Cluster is accessible");
  
  // Check collections
  const collectionsResponse = await fetch(`${QDRANT_URL}/collections`, {
    headers: {
      'api-key': QDRANT_API_KEY
    }
  });
  
  if (!collectionsResponse.ok) {
    throw new Error(`Collections check failed: ${collectionsResponse.status} ${collectionsResponse.statusText}`);
  }
  
  const collectionsData = await collectionsResponse.json();
  const collections = collectionsData.result?.collections || [];
  const collectionExists = collections.some(collection => collection.name === COLLECTION_NAME);
  
  if (collectionExists) {
    console.log(`✅ SUCCESS: '${COLLECTION_NAME}' collection exists`);
    console.log(`📊 Total collections: ${collections.length}`);
    console.log(`🎯 Cluster ping completed successfully at ${new Date().toISOString()}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 Cluster ping completed successfully!");
    process.exit(0);
  } else {
    console.error(`❌ ERROR: '${COLLECTION_NAME}' collection not found`);
    console.log(`📊 Available collections: ${collections.map(c => c.name).join(', ')}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("💥 Cluster ping failed!");
    process.exit(1);
  }
  
} catch (error) {
  console.error("❌ FAILED to ping Vector Store (Qdrant) cluster:");
  console.error("Error details:", error.message);
  
  if (error.message.includes("401") || error.message.includes("Unauthorized")) {
    console.error("💡 Hint: Check your QDRANT_API_KEY configuration");
  } else if (error.message.includes("network") || error.message.includes("fetch")) {
    console.error("💡 Hint: Check your QDRANT_URL and network connectivity");
  }
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.error("💥 Cluster ping failed!");
  process.exit(1);
}