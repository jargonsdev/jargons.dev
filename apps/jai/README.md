<div align="center" style="margin-top: 12px">
  <a href="https://www.jargons.dev">
    <img width="300" alt="jargons.dev AI" src="https://github.com/user-attachments/assets/5459f7e3-2e23-43bf-b52b-2f198c1dd413">
  </a>
  <h1><tt>jargons.dev AI (jAI)</tt></h1>
  <h3>The AI-Powered Assistant for jargons.dev</h3>
</div>

## About

✨jAI is a Retrieval-Augmented Generation (RAG) application that integrates the `jargons.dev` dictionary as its core knowledge base. This module serves as the AI utilities layer for the main jargons.dev application, providing intelligent assistance and semantic search capabilities throughout the platform.

Unlike standalone AI applications, ✨jAI is deeply integrated into the jargons.dev ecosystem, powering features like:
- Intelligent word explanations and follow-up conversations
- Semantic search across the dictionary
- Context-aware responses based on the curated dictionary content
- Real-time AI assistance for developers exploring technical terms

## Tech Stack

✨jAI is built using the following technologies:

- [OpenAI API](https://openai.com/api/) - Platform for building AI experiences powered by industry-leading models and tools. Powers AI chat responses and generates embeddings for semantic search
- [Qdrant](https://qdrant.tech/) - Vector database and similarity search engine for AI applications. Stores and searches vector embeddings of dictionary content for context retrieval
- [LangChain](https://langchain.com/) - Framework for developing applications powered by large language models (LLMs)

## Module Structure

The ✨jAI module is organized into focused utility files:

```
apps/jai/
├── index.js              # Main exports and module interface
└── lib/
    ├── jai-prompt.js      # AI personality and prompt templates
    ├── model.js           # OpenAI model configuration
    ├── utils.js           # Utility functions for message formatting
    └── vector-store.js    # Qdrant vector store integration
```

### Core Components

#### `index.js`
Main module interface that exports all ✨jAI utilities:
```javascript
export { jAIPrompt, formatMessage, model, vectorStore };
```

#### `lib/jai-prompt.js`
Defines ✨jAI's personality and conversation templates. The AI assistant is designed to:
- Explain technical jargon clearly and concisely
- Use relatable analogies and developer-friendly examples
- Maintain a friendly, witty personality
- Encourage follow-up questions and deeper exploration

#### `lib/model.js`
Configures the OpenAI ChatGPT model with optimized settings for technical explanations:
- Streaming responses for real-time interaction
- Temperature tuned for consistent, helpful responses
- Token limits optimized for concise explanations

#### `lib/vector-store.js`
Manages the Qdrant vector database integration:
- Semantic search across dictionary content
- OpenAI embeddings for high-quality similarity matching
- Production-ready vector store connection

#### `lib/utils.js`
Utility functions for message processing and formatting.

## Environment Variables

✨jAI requires the following environment variables:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_CHAT_MODEL=gpt-4-turbo-preview  # or your preferred model
OPENAI_EMBEDDINGS_MODEL=text-embedding-3-small

# Qdrant Vector Database
QDRANT_URL=your_qdrant_instance_url
QDRANT_API_KEY=your_qdrant_api_key
```

## Setup and Usage

### 1. Prerequisites

Ensure you have the required environment variables configured in your `.env` file at the project root.

### 2. Seed the Vector Store

Before using ✨jAI, you need to populate the vector store with dictionary content:

```bash
npm run seed:jai
```

This command processes all dictionary entries and creates embeddings for semantic search.

## Architecture Integration

✨jAI is designed as a utility module that integrates seamlessly with the main jargons.dev application. The module is consumed in two primary areas:

### 1. Vector Store Seeding (`dev/seed-vector-store.js`)

Uses the `vectorStore` utility to populate the database with dictionary content. The script fetches dictionary entries from the jargons.dev API, processes them into document chunks, and creates vector embeddings for semantic search capabilities.

### 2. API Endpoint (`src/pages/api/jai/follow-up-chat.js`)

Imports all four core utilities (`jAIPrompt`, `model`, `formatMessage`, `vectorStore`) for real-time AI interactions. Powers the follow-up chat feature with semantic search for relevant context, conversation history management, and streaming AI response generation.

### Integration Flow

1. **Data Preparation**: `seed-vector-store.js` populates the vector database with dictionary content
2. **Runtime Processing**: API endpoints use ✨jAI utilities for semantic search and AI response generation
3. **Real-time Interaction**: Streaming responses provide immediate feedback to users
4. **Context Awareness**: Vector search ensures AI responses are grounded in dictionary content

## Development

### Local Development
✨jAI runs as part of the main jargons.dev development environment:

```bash
npm start  # Starts the development server with ✨jAI enabled
```

### Testing
AI functionality is tested as part of the main project's test suite:

```bash
npm run test          # Run all tests including AI utilities
npm run test:coverage # Generate coverage report
```

## Contributing

Contributions to ✨jAI are welcome! Please refer to the main project's [Contribution Guide](../../CONTRIBUTING.md) for guidelines.

When contributing to ✨jAI specifically:
- Follow the modular structure for new utilities
- Maintain the friendly, developer-focused AI personality
- Test AI responses for accuracy and helpfulness
- Document any new environment variables or setup steps

## Support

✨jAI is part of the open-source jargons.dev project. Do leave the project a star ⭐️

For ✨jAI-specific issues or questions, please use the main project's issue tracker with the `✨jai` label.

---

**[Back to main jargons.dev project](../../README.md)**
