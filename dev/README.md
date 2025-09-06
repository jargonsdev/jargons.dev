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

### Features

- **API Integration**: Fetches live dictionary data from jargons.dev API
- **Document Processing**: Uses LangChain for intelligent text splitting and chunking
- **Batch Processing**: Efficiently handles large datasets with configurable batch sizes
- **Automatic Cleanup**: Removes temporary files after processing
- **Progress Tracking**: Provides detailed console output for monitoring

### When to Use

Run this script when you need to:
- Initialize ✨jAI's knowledge base for the first time
- Update ✨jAI with the latest dictionary content
- Rebuild ✨jAI's vector store after making changes to the AI system
- Prepare ✨jAI for development or testing of AI-powered features

### Prerequisites

Before running this script, ensure you have:
- All dependencies installed (`npm ci`)
- OPENAI and QDRANT environment variables properly configured in your `.env` file
- Network access to fetch from jargons.dev API
- Sufficient disk space for temporary dictionary file

### Usage

```bash
npm run seed:jai
```

### How It Works

The script performs these steps to prepare ✨jAI's knowledge base:

1. **Data Fetching**: Downloads the complete dictionary from `https://jargons.dev/api/v1/browse`
2. **File Processing**: Saves data locally and loads it using LangChain's JSONLoader
3. **Document Splitting**: Breaks content into optimally-sized chunks (1000 chars with 200 overlap)
4. **Vector Store Population**: Adds processed documents to ✨jAI's vector store in batches of 100
5. **Cleanup**: Removes temporary files and provides completion summary

### Technical Implementation

The script leverages several key technologies:

- **LangChain JSONLoader**: Extracts title and content fields from dictionary entries
- **RecursiveCharacterTextSplitter**: Intelligently splits text while preserving context
- **Batch Processing**: Prevents memory issues and provides progress feedback
- **File System Operations**: Handles temporary file creation and cleanup

### Configuration Options

Key parameters that can be adjusted:

- **Chunk Size**: Currently 1000 characters (optimal for most search queries)
- **Chunk Overlap**: 200 characters (ensures context preservation)
- **Batch Size**: 100 documents per batch (balances performance and memory usage)

### Error Handling

The script includes robust error handling for:
- Network connectivity issues during API calls
- File system errors during temporary file operations
- Vector store connection problems
- Memory management during large batch processing

### Example Output

```
Saved the dictionary file to /path/to/dev/dictionary.json
Loaded 500 documents
Split 1250 documents
Added batch 1 of 13 (100 documents) to the vector store
Added batch 2 of 13 (100 documents) to the vector store
...
Added 1250 splits to the vector store
Cleaned up the dictionary file at /path/to/dev/dictionary.json
```

Once completed, ✨jAI will have access to the processed dictionary content and can provide intelligent responses about software engineering terms.

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
