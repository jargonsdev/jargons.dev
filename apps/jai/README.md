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

- **AI-powered word definitions**: Generate instant definitions for technical terms not yet in the dictionary
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
├── index.js               # Main exports and module interface
├── components/            # React components for UI/feature integration
│   ├── logo.jsx           # jAI Logo
│   └── word-search.jsx    # jAI Word Search feature
└── lib/
    ├── jai-prompts.js      # AI personality and prompt templates
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

#### `lib/jai-prompts.js`

Defines ✨jAI's personality and conversation templates. The AI assistant is designed to:

- Explain technical jargon clearly and concisely
- Use relatable analogies and developer-friendly examples
- Maintain a friendly, witty personality
- Encourage follow-up questions and deeper exploration
- Generate accurate, SEO-friendly definitions for technical terms
- Provide structured responses optimized for dictionary content

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

#### `components/logo.jsx`

SVG React component for the ✨jAI logo with customizable styling. Used throughout the application for branding and visual identity.

#### `components/word-search.jsx`

React component that powers the AI-driven word definition feature. Includes:

- **JAIWordSearch**: Main component for generating and displaying AI-powered word definitions
- **JAIWordSearchTrigger**: UI trigger component for initiating word searches with ✨jAI
- Streaming response handling for real-time definition generation
- Error handling and loading states
- Integration with the `/api/jai/search` endpoint

## Environment Variables

✨jAI requires the following environment variables:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_CHAT_MODEL=gpt-4.1-mini  # or your preferred model
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

✨jAI is designed as a utility module that integrates seamlessly with the main jargons.dev application. The module is consumed in three primary areas:

### 1. Vector Store Seeding (`dev/seed-vector-store.js`)

Uses the `vectorStore` utility to populate the database with dictionary content. The script fetches dictionary entries from the jargons.dev API, processes them into document chunks, and creates vector embeddings for semantic search capabilities.

### 2. Word Search API (`src/pages/api/jai/search.js`)

Dedicated endpoint for AI-powered word definitions that:

- Uses the `SEARCH_WORD` prompt template for structured, dictionary-optimized responses
- Streams AI-generated definitions in real-time
- Provides fallback definitions for terms not yet in the dictionary
- Powers the `/browse/with-jai` page and word search components

<!-- ### 3. Follow-up Chat API (`src/pages/api/jai/follow-up-chat.js`)

Imports all four core utilities (`jAIPrompt`, `model`, `formatMessage`, `vectorStore`) for real-time AI interactions. Powers the follow-up chat feature with semantic search for relevant context, conversation history management, and streaming AI response generation. -->

### Integration Flow

1. **Data Preparation**: `seed-vector-store.js` populates the vector database with dictionary content
2. **Word Search Flow**: Users can search for undefined terms via `/browse/with-jai`, which uses the search API to generate instant definitions
3. **Runtime Processing**: API endpoints use ✨jAI utilities for semantic search and AI response generation
4. **Real-time Interaction**: Streaming responses provide immediate feedback to users
5. **Context Awareness**: Vector search ensures AI responses are grounded in dictionary content

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
