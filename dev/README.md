# <tt>jargons.dev</tt> Dev Scripts

## Setup Script

This script streamlines the process of creating a GitHub App required to run jargons.dev locally and sets up the environment file (.env) for you. Here's how to use it:

1. **Run the Setup Script:**
   - Run `npm run setup` in your terminal to start the setup process.

2. **Enter App Name:**
   - You will be prompted to enter an app name. The default app name is `jargons.dev-app-for-`, which you should append with your GitHub username to make it unique, example: `jargons.dev-app-for-babblebey`.

3. **Create a New GitHub Repository:**
   - Manually create a new GitHub repository with the name "jargons.dev-test" at [https://github.com/new](https://github.com/new).

4. **Update the Environment Variables:**
   - Once the app is created, the script will create a `.env` file with the necessary variables.
   - Open the `.env` file and replace the value of `PUBLIC_PROJECT_REPO` with your newly created repository's name. Example: `PUBLIC_PROJECT_REPO="your-username/jargons.dev-test"`

5. **Install the GitHub App:**
   - Follow the link provided in the script output to install the GitHub App on your repository.

This script simplifies the setup process for running <tt>jargons.dev</tt> locally and ensures that your GitHub App is configured correctly. If you encounter any issues during setup, please reach out or craeting an issue.

## Seed Vector Store Script

This script prepares the knowledge base for **✨jAI** (jargons.dev AI) by populating the vector store with dictionary content. jAI uses this processed data to provide intelligent responses and semantic understanding of software engineering terms.

### When to Use

Run this script when you need to:
- Initialize ✨jAI's knowledge base for the first time
- Update ✨jAI with the latest dictionary content
- Rebuild ✨jAI's vector store after making changes to the AI system
- Prepare ✨jAI for development or testing of AI-powered features

### Prerequisites

Before running this script, ensure you have:
- All dependencies installed (`npm ci`)
- `OPENAI_API_KEY`, `QDRANT_URL`  and `QDRANT_API_KEY` environment variables properly configured in your `.env` file
- Network access to fetch from jargons.dev API

### Usage

```bash
npm run seed:jai
```

### How It Works

The script performs these steps to prepare ✨jAI's knowledge base:

1. **Data Fetching**: Downloads the complete dictionary from `https://jargons.dev/api/v1/browse`
2. **Document Creation**: Creates LangChain `Document` objects directly from the API response, attaching `slug` metadata to each word for future incremental updates
3. **Document Splitting**: Breaks content into optimally-sized chunks (1000 chars with 200 overlap), preserving the slug metadata on every chunk
4. **Vector Store Population**: Adds processed documents to ✨jAI's vector store in batches of 100

### Technical Implementation

The script leverages several key technologies:

- **LangChain Document**: Creates documents directly from API data with `metadata.slug` for traceability
- **RecursiveCharacterTextSplitter**: Intelligently splits text while preserving context
- **Batch Processing**: Prevents memory issues and provides progress feedback

### Configuration Options

Required environment variables:

- **QDRANT_URL**: Your Qdrant cluster endpoint (e.g., `https://your-cluster.gcp.cloud.qdrant.io`)
- **QDRANT_API_KEY**: Your Qdrant cluster API key for authentication
- **OPENAI_API_KEY**: Your OpenAI API Key with appopriate chat and embedding models (value specified in `OPENAI_CHAT_MODEL` and `OPENAI_EMBEDDINGS_MODEL`)  allowed

Key parameters that can be adjusted:

- **Chunk Size**: Currently 1000 characters (optimal for most search queries)
- **Chunk Overlap**: 200 characters (ensures context preservation)
- **Batch Size**: 100 documents per batch (balances performance and memory usage)

### Error Handling

The script includes robust error handling for:
- Network connectivity issues during API calls
- Vector store connection problems
- Memory management during large batch processing

### Example Output

```
Fetched 500 words from the API
Created 500 documents
Split into 1250 chunks
Added batch 1 of 13 (100 documents) to the vector store
Added batch 2 of 13 (100 documents) to the vector store
...
Added 1250 splits to the vector store
```

Once completed, ✨jAI will have access to the processed dictionary content and can provide intelligent responses about software engineering terms.

> **Note:** After running a full seed, all vector points will include `metadata.slug`, which is required for incremental updates via the [Update Vector Store Script](#update-vector-store-script) to work correctly.

## Update Vector Store Script

This script performs **incremental updates** to ✨jAI's vector store when dictionary words are added, modified, or removed. Instead of re-seeding the entire collection, it targets only the changed words — making it fast and efficient for CI/CD use after new words are merged.

### When to Use

This script is primarily run automatically via the **Update Vector Store** GitHub Actions workflow when a new word PR is merged and the Vercel production deployment succeeds. You can also run it manually when you need to:
- Add or update specific words in the vector store
- Remove deleted words from the vector store
- Fix vector store entries for particular terms

### Prerequisites

Before running this script, ensure you have:
- All dependencies installed (`npm ci`)
- `OPENAI_API_KEY`, `OPENAI_EMBEDDINGS_MODEL`, `QDRANT_URL` and `QDRANT_API_KEY` environment variables properly configured in your `.env` file
- Network access to fetch from the jargons.dev production API
- The vector store has been initially seeded with `metadata.slug` on all points (via `npm run seed:jai`)

### Usage

**Local Development:**
```bash
npm run update:jai -- --upsert slug1,slug2 --delete slug3,slug4
```

**CI/CD (without .env file):**
```bash
npm run update:jai:ci -- --upsert slug1,slug2 --delete slug3
```

### Flags

- `--upsert <slugs>` — Comma-separated slugs of words to add or update. For each slug, the script deletes any existing chunks in Qdrant (by `metadata.slug` filter), fetches the latest content from the production API, splits it into chunks, and adds them to the vector store.
- `--delete <slugs>` — Comma-separated slugs of words to remove. Deletes all chunks matching the slug from Qdrant.

Both flags are optional, but at least one must be provided for the script to do anything.

### How It Works

The script performs these steps for each word:

**For upserts (add/update):**
1. **Delete Old Chunks**: Removes existing vector points matching `metadata.slug` via a Qdrant filter
2. **Fetch Latest Content**: Downloads the word from `https://jargons.dev/api/v1/browse/{slug}`
3. **Create Document**: Builds a LangChain `Document` with `metadata.slug` for traceability
4. **Split into Chunks**: Breaks content into optimally-sized chunks (1000 chars with 200 overlap)
5. **Add to Vector Store**: Upserts the new chunks into Qdrant

**For deletes:**
1. **Delete Chunks**: Removes all vector points matching `metadata.slug` via a Qdrant filter

### Technical Implementation

The script leverages several key technologies:

- **LangChain Document**: Creates documents with `metadata.slug` for targeted updates
- **Qdrant Filter-based Deletion**: Uses `vectorStore.delete({ filter })` with a `metadata.slug` match condition to precisely target existing chunks for a word
- **RecursiveCharacterTextSplitter**: Same chunking config as the seed script (1000/200) for consistency
- **Production API**: Fetches from the deployed site to ensure the vector store matches the live content

### Configuration Options

Required environment variables:

- **QDRANT_URL**: Your Qdrant cluster endpoint (e.g., `https://your-cluster.gcp.cloud.qdrant.io`)
- **QDRANT_API_KEY**: Your Qdrant cluster API key for authentication
- **OPENAI_API_KEY**: Your OpenAI API Key for generating embeddings
- **OPENAI_EMBEDDINGS_MODEL**: The embeddings model to use (e.g., `text-embedding-3-small`)

### Automated via GitHub Actions

The **Update Vector Store** workflow (`.github/workflows/update-vector-store.yml`) runs this script automatically:

- **Trigger**: Fires on `deployment_status` events — specifically when Vercel reports a successful **Production** deployment
- **PR Label Gate**: Uses the GitHub API to find the merged PR associated with the deployment commit and checks for the `📖new-word` or `📖edit-word` labels. Deployments from PRs without these labels are skipped early (before any Node.js setup or dependency installation)
- **Change Detection**: Diffs `HEAD~1` to identify added, modified, or deleted `.mdx` files in `src/content/dictionary/`
- **Skip Logic**: Exits early if no dictionary files were changed in the commit
- **Manual Trigger**: Can also be run manually from the GitHub Actions tab with custom `upsert_slugs` and `delete_slugs` inputs (bypasses the label check)
- **Required Secrets**: `OPENAI_API_KEY`, `QDRANT_URL`, `QDRANT_API_KEY`
- **Required Variables**: `OPENAI_EMBEDDINGS_MODEL`

### Error Handling

The script includes robust error handling for:
- Missing or invalid CLI arguments (prints usage and exits gracefully)
- Words not found on the production API (404 — warns and continues with remaining slugs)
- Network connectivity issues
- Vector store connection and deletion failures
- Per-word error isolation (one failing slug doesn't block the others)
- Non-zero exit code if any operation fails

### Example Output

```
🚀 Starting incremental vector store update...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Words to upsert: api, closure
🗑️  Words to delete: old-term

🔄 Processing upsert for "api"...
   Deleting old chunks for "api"...
   Split into 3 chunk(s).
   ✅ Upserted "api" (3 chunks)

🔄 Processing upsert for "closure"...
   Deleting old chunks for "closure"...
   Split into 2 chunk(s).
   ✅ Upserted "closure" (2 chunks)

🗑️  Deleting "old-term" from vector store...
   ✅ Deleted "old-term"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Done! Upserted: 2, Deleted: 1, Failed: 0
🎉 Vector store update completed successfully!
```

## Vector Store Cluster Ping Script

This script performs a lightweight health check on the Vector Store (Qdrant) cluster to keep it active and prevent automatic deletion due to inactivity. It's designed to be run both locally for testing and automatically via GitHub Actions.

### When to Use

Run this script when you need to:
- Test Qdrant cluster connectivity and collection status
- Keep the cluster active to prevent auto-deletion from inactivity
- Verify that the 'dictionary' collection exists and is accessible
- Debug vector store connection issues during development

### Prerequisites

Before running this script, ensure you have:
- `QDRANT_URL` and `QDRANT_API_KEY` environment variables configured
- Network access to your Qdrant cluster
- The 'dictionary' collection exists in your Qdrant instance

### Usage

**Local Development:**
```bash
npm run ping:qdrant
```

**CI/CD (without .env file):**
```bash
npm run ping:qdrant:ci
```

### How It Works

The script performs these health checks:

1. **Environment Validation**: Verifies required environment variables are set
2. **Basic Connectivity**: Tests the cluster endpoint with a health check request
3. **Collections Check**: Retrieves and validates the existence of the 'dictionary' collection
4. **Status Reporting**: Provides detailed success/failure feedback with helpful error hints

### Technical Implementation

The script uses several key approaches:

- **Direct REST API Calls**: Uses native fetch() for lightweight, dependency-free requests
- **Comprehensive Error Handling**: Provides specific error messages and troubleshooting hints
- **Environment Variable Validation**: Checks configuration before attempting connections
- **Collection Verification**: Ensures the required 'dictionary' collection exists

### Configuration

Required environment variables:

- **QDRANT_URL**: Your Qdrant cluster endpoint (e.g., `https://your-cluster.gcp.cloud.qdrant.io`)
- **QDRANT_API_KEY**: Your Qdrant cluster API key for authentication
- **COLLECTION_NAME**: Hardcoded to "dictionary" (the collection ✨jAI uses)

### Automated Scheduling

The script is automatically run via GitHub Actions:
- **Schedule**: Every Sunday and Wednesday at midnight UTC
- **Manual Trigger**: Can be run manually from GitHub Actions tab
- **Purpose**: Prevents cluster deletion due to inactivity

### Error Handling

The script includes detailed error handling for:
- Missing or invalid environment variables
- Network connectivity issues
- Authentication failures (401 Unauthorized)
- Missing collections
- API response parsing errors

### Example Output

**Successful Run:**
```
🚀 Starting Vector Store (Qdrant) cluster ping...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 Checking Vector Store (Qdrant) cluster connectivity...
✅ Cluster is accessible
✅ SUCCESS: 'dictionary' collection exists
📊 Total collections: 1
🎯 Cluster ping completed successfully at 2025-09-16T10:30:00.000Z
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Cluster ping completed successfully!
```

**Error Example:**
```
🚀 Starting Vector Store (Qdrant) cluster ping...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ ERROR: QDRANT_URL environment variable is not set
💡 Make sure QDRANT_URL is configured in your environment or GitHub secrets
```

This script ensures your Qdrant cluster remains active and accessible for ✨jAI's vector search functionality.

## Format-Staged Script

This script provides a cross-platform solution for formatting only the files that are staged in Git, making it perfect for pre-commit workflows without requiring external dependencies like Husky or lint-staged.

### Features

- **Cross-Platform Compatible**: Works on Windows, macOS, and Linux using only Node.js built-ins
- **No External Dependencies**: Uses only `child_process` and `fs` modules from Node.js
- **Smart File Filtering**: Only formats files with supported extensions
- **Git Integration**: Automatically detects staged files using `git diff --cached`
- **Comprehensive Format Support**: Handles `.js`, `.ts`, `.jsx`, `.tsx`, `.astro`, `.json`, `.css`, and `.md` files

### Usage

**Manual Pre-Commit Formatting:**
```bash
npm run format:staged
```

**Typical Workflow:**
1. Make your code changes
2. Stage the files you want to commit: `git add .` or `git add <specific-files>`
3. Run the format script: `npm run format:staged`
4. Commit your changes: `git commit -m "Your commit message"`

### How It Works

The script performs these steps:

1. **Detects Staged Files**: Uses `git diff --cached --name-only --diff-filter=ACMR` to find staged files
2. **Filters Supported Types**: Only processes files with extensions that Prettier can handle
3. **Verifies File Existence**: Skips deleted files to avoid errors
4. **Formats Files**: Runs Prettier on the filtered list of staged files
5. **Provides Feedback**: Shows which files are being formatted and confirms success

### Supported File Types

- JavaScript (`.js`, `.jsx`)
- TypeScript (`.ts`, `.tsx`) 
- Astro components (`.astro`)
- JSON (`.json`)
- CSS (`.css`)
- Markdown (`.md`)

### Error Handling

- Gracefully handles cases with no staged files
- Skips deleted files automatically
- Provides clear error messages if formatting fails
- Exits with appropriate status codes for CI/CD integration

### Why This Approach?

This script was chosen over traditional tools like Husky and lint-staged because:
- **No Network Dependencies**: Doesn't require downloading additional packages during setup
- **Simpler Setup**: No additional configuration files needed
- **Cross-Platform**: Works consistently across different operating systems
- **Lightweight**: Minimal overhead and fast execution
