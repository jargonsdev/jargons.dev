# Testing Documentation

## Overview

Comprehensive testing strategy for jargons.dev ensuring code quality and reliability across all components.

## Test Framework & Tools

- **vitest** - Modern testing framework with TypeScript support
- **happy-dom** - Browser environment simulation for testing
- **@testing-library/jest-dom** - DOM testing utilities and assertions
- **@vitest/coverage-v8** - Code coverage reporting

## Current Test Coverage

- **161 tests** across 7 test suites
- **99.4% overall test success rate** (160 passing, 1 unrelated failure)
- **98.5%** coverage on constants validation (`constants.js`)
- **95.34%** coverage on crypto functions (`src/lib/utils/crypto.js`)
- **100%** coverage on utility functions (`src/lib/utils/index.js`)
- **Complete coverage** on business logic functions (`submit-word.js`, `word-editor.js`, `branch.js`, `fork.js`)

## Available Commands

```sh
npm run test          # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:ui       # Open Vitest UI interface
npm run test:coverage # Generate detailed coverage report
```

## Test Structure

```
tests/
├── setup.js                     # Test environment configuration with MSW
├── fixtures/                    # Test data and API response mocks
│   ├── test-data/
│   │   └── index.js             # Sample words and repository details
│   └── github-responses/
│       └── index.js             # GitHub API response fixtures
├── mocks/
│   └── github-api.js            # MSW handlers for GitHub API endpoints
└── unit/
    ├── constants/
    │   └── constants.test.js     # Project constants validation
    ├── lib/                      # Business logic tests
    │   ├── submit-word.test.js   # PR creation and submission logic
    │   ├── word-editor.test.js   # Word file management operations
    │   ├── branch.test.js        # Git branch operations
    │   └── fork.test.js          # Repository forking logic
    └── utils/
        ├── crypto.test.js        # Encryption/decryption functions
        └── index.test.js         # Utility functions
```

## Testing Strategy Phases

### ✅ Phase 1: Foundation Tests (Complete)

- **Utility Functions** - Date calculations, string parsing, URL building, text formatting
- **Crypto Functions** - Encryption/decryption with security validation and error handling
- **Constants Validation** - Project configuration, labels, and SEO compliance

### ✅ Phase 2: Business Logic Tests (Complete)

- **Word management functions** (`submit-word.js`, `word-editor.js`)
- **Git operations** (`branch.js`, `fork.js`)
- **GitHub API interactions** and error handling
- **MSW (Mock Service Worker)** integration for realistic API testing

### 📋 Phases 3-5: Upcoming

- **Phase 3**: Component Tests (React components, Astro layouts)
- **Phase 4**: Integration Tests (API endpoints, data flow)
- **Phase 5**: End-to-End Tests (User workflows, browser testing)

## Test Details

### Phase 1 Implementation

#### Utility Functions (`tests/unit/utils/index.test.js`)

- **39 test cases** covering all 10 utility functions
- **100% coverage** with comprehensive edge case testing
- Functions tested: date calculations, string parsing, URL building, text formatting

#### Crypto Functions (`tests/unit/utils/crypto.test.js`)

- **17 test cases** with security-focused validation
- **95.34% coverage** including round-trip validation and error handling
- Tests: encryption format validation, tampered data detection, edge cases

#### Constants Validation (`tests/unit/constants/constants.test.js`)

- **20 test cases** ensuring proper structure and values
- **98.5% coverage** with configuration validation
- Tests: PROJECT_REPO_DETAILS validation, LABELS consistency, SEO compliance

### Phase 2 Implementation

#### Submit Word Functions (`tests/unit/lib/submit-word.test.js`)

- **19 test cases** covering PR creation and submission workflow
- **100% coverage** of pull request title generation, template rendering, and label assignment
- Tests: PR title formatting, template substitution, repository parsing, GitHub API error handling

#### Word Editor Functions (`tests/unit/lib/word-editor.test.js`)

- **26 test cases** covering word file management operations
- **100% coverage** of word creation, updates, and retrieval
- Tests: base64 encoding, template processing, path normalization, special character handling

#### Branch Operations (`tests/unit/lib/branch.test.js`)

- **24 test cases** covering Git branch management
- **100% coverage** of branch creation, retrieval, and deletion
- Tests: branch reference formatting, repository parsing, complex ref handling, error propagation

#### Fork Operations (`tests/unit/lib/fork.test.js`)

- **16 test cases** covering repository forking logic
- **100% coverage** of fork detection, creation, and synchronization
- Tests: GraphQL queries, fork status checking, automatic updates, nested error handling

## Writing Tests

### Test File Naming Convention

- Unit tests: `*.test.js`
- Integration tests: `*.integration.test.js`
- E2E tests: `*.e2e.test.js`

### Example Test Structure

```javascript
import { describe, it, expect } from "vitest";
import { functionName } from "../src/lib/utils";

describe("Function Group", () => {
  it("should handle basic case", () => {
    expect(functionName("input")).toBe("expected");
  });

  it("should handle edge cases", () => {
    expect(functionName("")).toBe("");
    expect(functionName(null)).toThrow();
  });
});
```

### Test Environment Setup

The test environment is configured in `tests/setup.js` with:

- Environment variable mocking for crypto keys
- GitHub configuration mocking
- DOM testing utilities setup
- **MSW (Mock Service Worker)** for GitHub API mocking
- Comprehensive test fixtures for GitHub API responses

## Running Specific Tests

```sh
# Run specific test file
npm test -- tests/unit/utils/index.test.js

# Run business logic tests
npm test -- tests/unit/lib/

# Run specific business logic function tests
npm test -- tests/unit/lib/submit-word.test.js

# Run tests matching pattern
npm test -- --grep "crypto"

# Run with coverage for specific files
npm run test:coverage -- --include="**/utils/**"

# Run tests in UI mode
npm run test:ui
```

## Coverage Reports

Generate detailed coverage reports with:

```sh
npm run test:coverage
```

Coverage reports include:

- Line coverage percentages
- Branch coverage analysis
- Function coverage metrics
- Uncovered line identification

## Contributing to Tests

### Guidelines

1. **Follow existing patterns** - Use established test structure and naming
2. **Aim for high coverage** - Target >90% coverage on new code
3. **Include edge cases** - Test error scenarios and boundary conditions
4. **Use descriptive names** - Test names should clearly describe what's being tested
5. **Group related tests** - Use `describe` blocks to organize test suites

### Best Practices

- **Test behavior, not implementation** - Focus on what the function does
- **Keep tests isolated** - Each test should be independent
- **Use meaningful assertions** - Prefer specific expectations over generic ones
- **Mock external dependencies** - Isolate code under test from external systems
- **Use MSW for API testing** - Mock GitHub API endpoints for realistic testing scenarios
- **Test error scenarios** - Verify proper error handling and propagation chains

## GitHub Issues

Track testing progress in our GitHub issues:

- [#171: Phase 1 - Foundation Tests](https://github.com/babblebey/dictionry/issues/171) ✅
- [#172: Phase 2 - Business Logic Tests](https://github.com/babblebey/dictionry/issues/172) ✅
- [#173: Phase 3 - Component Tests](https://github.com/babblebey/dictionry/issues/173)
- [#174: Phase 4 - Integration Tests](https://github.com/babblebey/dictionry/issues/174)
- [#175: Phase 5 - E2E Tests](https://github.com/babblebey/dictionry/issues/175)

## Configuration Files

### `vitest.config.js`

- Test environment setup (happy-dom)
- Coverage configuration
- Test file patterns and exclusions

### `tests/setup.js`

- Environment variable mocking
- Test utilities initialization
- Global test configuration
- **MSW server setup** for API mocking

### `tests/fixtures/`

- **Test data fixtures** - Sample words, repository details, and configuration
- **GitHub API responses** - Realistic API response mocks for testing

### `tests/mocks/`

- **MSW handlers** - GitHub API endpoint mocking for comprehensive testing

## Next Steps

1. **Phase 3 Implementation** - Begin component testing for React/Astro components
2. **Enhanced API Testing** - Expand MSW coverage for additional GitHub API endpoints
3. **Component Testing Framework** - Set up React/Astro component testing infrastructure
4. **CI/CD Integration** - Add automated testing to deployment pipeline
5. **Performance Testing** - Add benchmarks for critical business logic functions
