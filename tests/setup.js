import "@testing-library/jest-dom";

// Mock environment variables for tests
process.env.CRYPTO_SECRET_KEY = "test-secret-key-for-testing-only-32-chars";
process.env.PUBLIC_PROJECT_REPO = "jargonsdev/jargons.dev";
process.env.PUBLIC_PROJECT_REPO_BRANCH_REF = "refs/heads/main";
