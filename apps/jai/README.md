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
- **Interactive follow-up chat**: Ask context-aware questions about any word and get intelligent, conversation-based explanations
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
│   ├── follow-up-chat.jsx # jAI Follow-up Chat feature
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
export { jAIPrompts, formatMessage, model, vectorStore };
```

#### `lib/jai-prompts.js`

Defines ✨jAI's personality and conversation templates through two specialized prompts:

**`FOLLOW_UP_CHAT`**: Powers conversational interactions where jAI:

- Maintains a friendly, slightly witty personality as a knowledgeable coding buddy
- Explains technical concepts using clear analogies and real-world comparisons
- Provides context-aware answers based on the word being viewed
- Encourages curiosity and deeper exploration of topics
- Uses developer-centric examples (primarily JavaScript)
- Maintains conversation history for coherent follow-up discussions

**`SEARCH_WORD`**: Generates structured dictionary definitions that are:

- Formal, clear, and beginner-friendly
- SEO-optimized with natural keyword usage
- Accurate and up-to-date with industry standards
- Structured as: Meaning → Further Explanation → Example (when necessary)
- Focused on software, programming, and technology contexts

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

#### `components/follow-up-chat.jsx`

Interactive chat widget component for context-aware Q&A about dictionary terms. Features:

- **JAIFollowUpChatWidget**: Main chat interface with message history and streaming responses
- **JAIWordFollowUpChatWidgetTrigger**: Floating trigger button to open the chat widget
- Default question templates for quick interaction (e.g., "Can you give me a real-world example of {word}?")
- Authentication state management and login prompts for non-authenticated users
- Auto-scrolling chat container for smooth conversation flow
- Real-time streaming of AI responses using the `@ai-sdk/react` useChat hook
- Integration with the `/api/jai/follow-up-chat` endpoint
- User avatar display for personalized conversations

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

### 3. Follow-up Chat API (`src/pages/api/jai/follow-up-chat.js`)

Interactive chat endpoint that imports all four core utilities (`jAIPrompts`, `model`, `formatMessage`, `vectorStore`) for real-time AI conversations. This powers the follow-up chat feature with:

- **Semantic Search**: Retrieves relevant dictionary content using vector similarity search to ground responses in accurate context
- **Conversation History**: Maintains chat history for coherent, context-aware follow-up discussions
- **Streaming Responses**: Uses LangChain's RunnableSequence to stream AI responses in real-time
- **CORS Support**: Configured for production and preview deployments with proper cross-origin access
- The `FOLLOW_UP_CHAT` prompt template for conversational, developer-friendly explanations

### Integration Flow

1. **Data Preparation**: `seed-vector-store.js` populates the vector database with dictionary content
2. **Word Search Flow**: Users can search for undefined terms via `/browse/with-jai`, which uses the search API to generate instant definitions
3. **Follow-up Chat Flow**: Users viewing dictionary words can click "Ask jAI" to open an interactive chat widget that:
   - Offers default question templates for quick engagement
   - Accepts custom questions about the current word or related concepts
   - Retrieves relevant context from the vector store for accurate, grounded responses
   - Maintains conversation history for coherent multi-turn discussions
4. **Runtime Processing**: API endpoints use ✨jAI utilities for semantic search and AI response generation
5. **Real-time Interaction**: Streaming responses provide immediate feedback to users
6. **Context Awareness**: Vector search ensures AI responses are grounded in dictionary content

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
