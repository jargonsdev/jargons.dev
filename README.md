<div align="center" style="margin-top: 12px">
  <a href="https://www.jargons.dev">
    <img width="700" alt="jargons.dev" src="https://github.com/jargonsdev/jargons.dev/assets/25631971/5d1db25d-18e0-4544-ac98-9aa4e1097e14">
  </a>
  <h1><tt>jargons.dev</tt></h1>
   <h3>The Developer Literacy and Education Platform</h3>
</div>

## About

<tt>jargons.dev</tt> is an open source developer literacy and education platform. It helps people understand software development, engineering, and technology through community-created learning resources. The dictionary is its first content collection, with room to grow into additional formats.

## Tech Stack and Architecture

<tt>jargons.dev</tt> is built using the following open source technologies:

- [Astro](https://astro.build/) - Web framework for building content-driven websites
- [React](https://react.dev) - Library for building web interfaces
- [Tailwind CSS](https://tailwindcss.com) - A Utility-first CSS Library
- [Vercel AI SDK](https://ai-sdk.dev/) - Toolkit for building AI-powered features
- [LangChain](https://www.langchain.com/) - Framework for developing applications powered by large language models (LLMs)

### System Architecture

See https://excalidraw.com/#json=LNystqH62oqkWZaBLQ8l3,daK21Ngah4Vo1LRMcGipCg

## Run Project Locally

To run the project locally running on your machine, follow these simple steps.

### Prerequisite

To run the project locally, ensure your machine has **Node.js** installed. The project requires **Node.js** version 19 or higher. If you don't have **Node.js** installed, you can download it from the [Node.js website](https://nodejs.org/).

### Setup

To get set-up follow these steps:

1. Clone the repository:

   ```sh
   git clone https://github.com/jargonsdev/jargons.dev.git
   ```

2. Navigate to the project directory:

   ```sh
   cd jargons.dev
   ```

3. Install dependencies:

   ```sh
   npm ci
   ```

4. Run the `dev/setup` script and configure a content repository

   This script streamlines the process of creating a GitHub App required to run jargons.dev locally and sets up the environment file (.env) for you; Learn more at [dev/setup](/dev/README.md)

   ```sh
   npm run setup
   ```

5. Start the development server:

   ```sh
   npm start
   ```

6. Open your browser and visit `http://localhost:4321` to view the project.

## AI Features - Powering ✨jAI

<tt>jargons.dev</tt> includes **✨jAI** (jargons.dev AI) - an intelligent assistant that helps users explore and understand software engineering terms through AI-powered interactions. Learn more in the **[apps/jai](./apps/jai/README.md)** module.

### Setup ✨jAI

To enable ✨jAI, you need to seed the vector store with dictionary content that ✨jAI uses for its knowledge base:

```sh
npm run seed:jai
```

This script prepares the vector store with processed dictionary content, enabling ✨jAI to provide intelligent responses and semantic search capabilities.

**[Learn more about ✨jAI setup](./dev/README.md#seed-vector-store-script)** for detailed configuration and usage instructions.

## Testing

<tt>jargons.dev</tt> implements comprehensive testing to ensure code quality and reliability.

### Quick Start

```sh
npm run test          # Run all tests
npm run test:coverage # Generate coverage report
```

**[View detailed testing documentation](./tests/README.md)** for test structure, writing guidelines, and phase-based testing strategy.

## Contributing

We welcome contributions to jargons.dev! There are two main ways you can contribute to:

1. **Content Contribution:**
   Use the Jargons Editor at [jargons.dev/editor](https://jargons.dev/editor) to suggest dictionary changes. Content is maintained in the separate [jargonsdev/content](https://github.com/jargonsdev/content) repository; see its README for direct contribution guidance.

2. **Core Contributions:**
   For issue reporting, code and documentation improvements, bug fixes, or feature enhancements to the website, contribute to this repository.

To get started with contributing, please refer to our [Contribution Guide](./CONTRIBUTING.md). Thank you for contributing to the jargons.dev project!

## Support

Do leave the project a star ⭐️
