<div align="center" style="margin-top: 12px">
  <a href="https://www.jargons.dev">
    <img width="700" alt="jargons.dev" src="https://github.com/jargonsdev/jargons.dev/assets/25631971/5d1db25d-18e0-4544-ac98-9aa4e1097e14">
  </a>
  <h1><tt>jargons.dev</tt></h1>
  <h3>The Software Engineering Dictionary</h3>
</div>

## About

<tt>jargons.dev</tt> is an open source dictionary curated by contributors providing simplified meaning and definitions to software development, engineering, and general technology terms.

## Tech Stack and Architecture

<tt>jargons.dev</tt> is built using the following open source technologies:

- [Astro](https://astro.build/) - Web framework for building content-driven websites
- [React](https://react.dev) - Library for building web interfaces
- [Tailwind CSS](https://tailwindcss.com) - A Utility-first CSS Library

### System Architecture

See https://excalidraw.com/#json=51IqiNvrZiY15ZtjK0WXn,jcpW9rmzMR9OVwM05Zd1LQ

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

4. Run the `dev/setup` script and create test repo

   This script streamlines the process of creating a GitHub App required to run jargons.dev locally and sets up the environment file (.env) for you; Learn more at [dev/setup](/dev/README.md)

   ```sh
   npm run setup
   ```

5. Start the development server:

   ```sh
   npm start
   ```

6. Open your browser and visit `http://localhost:4321` to view the project.

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

1. **Dictionary Word Contribution:**
   This includes adding new words to the dictionary or editing existing word entries. We highly recommend using our Jargons Editor at [jargons.dev/editor](https://jargons.dev/editor) for this purpose. This user-friendly interface streamlines your contribution allowing it end up as a pull request.

2. **Other Contributions:**
   These are contributions other than adding or editing words in the dictionary, feel free to contribute in other ways such as issue reporting/triaging, code/documentation improvements, bug fixes, or feature enhancements.

To get started with contributing, please refer to our [Contribution Guide](./CONTRIBUTING.md). Thank you for contributing to the jargons.dev project!

## Support

Do leave the project a star ⭐️
