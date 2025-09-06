import "@testing-library/jest-dom";
import { setupServer } from "msw/node";
import { githubHandlers } from "./mocks/github-api.js";
import { beforeAll, afterAll, afterEach } from "vitest";

// Mock environment variables for tests
process.env.CRYPTO_SECRET_KEY = "test-secret-key-for-testing-only-32-chars";
process.env.PUBLIC_PROJECT_REPO = "jargonsdev/jargons.dev";
process.env.PUBLIC_PROJECT_REPO_BRANCH_REF = "refs/heads/main";

// Setup MSW server for API mocking
export const server = setupServer(...githubHandlers);

// Start server before all tests
beforeAll(() => {
  server.listen({
    onUnhandledRequest: "error",
  });
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
});

// Stop server after all tests
afterAll(() => {
  server.close();
});
