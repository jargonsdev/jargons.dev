// README.md
<div align="center">
  <a href="https://www.jargons.dev">
    <img width="700" alt="jargons.dev" src="https://github.com/jargonsdev/jargons.dev/assets/25631971/5d1db25d-18e0-4544-ac98-9aa4e1097e14">
  </a>
  <h1><tt>jargons.dev</tt></h1>
  <h3>The Software Engineering Dictionary</h3>
</div>

# Table of Contents

* [About](#about)
* [Features](#features)
* [Getting Started](#getting-started)
* [Tech Stack](#tech-stack)
* [Contributing](#contributing)
* [Support](#support)

## About 🚀

**jargons.dev** is an open-source dictionary curated by contributors, providing simplified meanings and definitions for software development, engineering, and general technology terms.

## Features ✨

- 📚 Comprehensive tech dictionary
- 🔍 Fast, fuzzy search
- ✏️ User-friendly contribution editor
- 📱 Mobile-optimized interface
- 🎯 Clear, concise definitions

## Tech Stack 💻

Built with modern, open-source technologies:

- [Astro](https://astro.build/) - Lightning-fast web framework
- [React](https://react.dev) - UI component library
- [Tailwind CSS](https://tailwindcss.com) - Utility-first styling

## Getting Started 🌟

See our [Setup Guide](./SETUP.md) for detailed installation instructions.

### Quick Start

```bash
# Clone repository
git clone https://github.com/jargonsdev/jargons.dev.git

# Navigate to project
cd jargons.dev

# Install dependencies
npm ci

# Run setup
npm run setup

# Start development server
npm start
```

## Contributing 🤝

See our [Contributing Guide](./CONTRIBUTING.md) for details on how to participate.

## Support ⭐

If you find jargons.dev helpful, please star the repository!

---

// CONTRIBUTING.md
# Contributing to jargons.dev

Thank you for your interest in contributing to jargons.dev! 🎉

## Ways to Contribute

### 1. Dictionary Content 📚

Use our [Jargons Editor](https://jargons.dev/editor) to:
- Add new terms
- Edit existing definitions
- Improve explanations

### 2. Code Contributions 💻

- Bug fixes
- Feature enhancements
- Documentation improvements
- Performance optimizations

## Contribution Process

1. **Fork & Clone**
```bash
git clone https://github.com/your-username/jargons.dev.git
```

2. **Create Branch**
```bash
git checkout -b feature/your-feature
```

3. **Make Changes**
- Follow coding standards
- Add tests where applicable
- Update documentation

4. **Submit PR**
- Clear description
- Reference issues
- Add screenshots if relevant

## Code Style Guide

- Use ESLint configuration
- Follow Prettier formatting
- Write meaningful commit messages
- Add JSDoc comments for functions

## Content Guidelines

- Clear, concise definitions
- Include relevant examples
- Add references when needed
- Use appropriate categories

---

// SETUP.md
# Setup Guide

## Prerequisites

- Node.js v19.0.0+
- Git
- GitHub account

## Development Setup

1. **Environment Setup**

Create `.env` file:
```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_APP_ID=your_app_id
```

2. **GitHub App Configuration**

a. Create GitHub App:
- Go to GitHub Developer Settings
- Set homepage: `http://localhost:4321`
- Callback URL: `http://localhost:4321/api/auth/callback`

b. Save credentials in `.env`

3. **Project Setup**

```bash
# Install dependencies
npm ci

# Run setup script
npm run setup

# Start development
npm start
```

## Project Structure
```
jargons.dev/
├── src/
│   ├── components/    # React components
|   |__ content/       # Content
│   ├── layouts/       # Page layouts
|   |__ Lib/           # Lib
│   ├── pages/         # Routes
│   └── styles/        # Global styles
├── public/            # Static assets
└── dev/              # Dev tools
```

---

// TROUBLESHOOTING.md
# Troubleshooting Guide

## Common Issues

### Installation Problems

**Issue**: Dependencies fail to install

**Solution**:
```bash
# Clear cache
npm cache clean --force

# Remove modules
rm -rf node_modules

# Reinstall
npm ci
```

### GitHub Authentication

**Issue**: GitHub App authentication fails

**Solution**:
1. Verify `.env` credentials
2. Check callback URL
3. Confirm app permissions

### Development Server

**Issue**: Server won't start

**Solution**:
1. Check Node.js version
2. Verify port 4321 is available
3. Review error logs

## Getting Help

1. Check existing issues
2. Join Discord community
3. Post in GitHub Discussions

---

// dev/README.md
# Development Guide

## Local Development

### Setup Script

The `setup` script handles:
- GitHub App creation
- Environment configuration
- Test repository setup
- Development environment validation

### Usage

```bash
npm run setup
```

## Environment Variables

Required variables:
```env
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_APP_ID=
```

## Development Tools

- ESLint for linting
- Prettier for formatting
- Jest for testing
- Husky for git hooks

## Build Process

```bash
# Build project
npm run build

# Preview build
npm run preview
```

## Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch
```