// Test data for business logic testing

export const sampleWords = {
  api: {
    title: "API",
    content:
      "Application Programming Interface (API) is a set of protocols, routines, and tools for building software applications.",
  },

  algorithm: {
    title: "Algorithm",
    content:
      "A step-by-step procedure for solving a problem or completing a task in programming.",
  },

  specialChars: {
    title: "C++",
    content:
      "A general-purpose programming language with object-oriented features.",
  },

  longTitle: {
    title:
      "Very Long Title That Might Cause Issues With URL Generation And File Naming",
    content: "A test case for handling very long titles in the system.",
  },

  emptyContent: {
    title: "Empty",
    content: "",
  },

  multilineContent: {
    title: "Multiline",
    content: `This is a multiline content
that spans multiple lines
and includes special characters like & < > " '`,
  },
};

export const sampleRepoDetails = {
  project: {
    repoFullname: "jargonsdev/jargons.dev",
    repoMainBranchRef: "refs/heads/main",
  },

  forked: {
    repoFullname: "testuser/jargons.dev",
    repoChangeBranchRef: "refs/heads/add-word-api",
  },

  forkedEdit: {
    repoFullname: "testuser/jargons.dev",
    repoChangeBranchRef: "refs/heads/edit-word-api",
  },
};

export const sampleBranches = {
  main: "refs/heads/main",
  feature: "refs/heads/add-word-api",
  edit: "refs/heads/edit-word-api",
  invalid: "invalid-branch-name",
  withSpecialChars: "refs/heads/add-word-c++",
};

export const sampleUsers = {
  testUser: {
    login: "testuser",
    id: 987654321,
  },

  jargonsdev: {
    login: "jargonsdev",
    id: 456789012,
  },
};

export const sampleShas = {
  main: "def456ghi789",
  feature: "abc123def456",
  updated: "ghi789jkl012",
};

export const sampleFilePaths = {
  api: "src/content/dictionary/api.mdx",
  algorithm: "src/content/dictionary/algorithm.mdx",
  specialChars: "src/content/dictionary/c.mdx",
  longTitle:
    "src/content/dictionary/very-long-title-that-might-cause-issues-with-url-generation-and-file-naming.mdx",
};

export const sampleCommitMessages = {
  newWord: (title) => `word: commit to "${title}"`,
  editWord: (title) => `word: edit commit to "${title}"`,
};

export const sampleErrorMessages = {
  networkError: "Network request failed",
  notFound: "Not Found",
  unauthorized: "Unauthorized",
  forbidden: "Forbidden",
  validationError: "Validation failed",
};

export const sampleBase64Content =
  "LS0tCnRpdGxlOiAiQVBJIgotLS0KCkFwcGxpY2F0aW9uIFByb2dyYW1taW5nIEludGVyZmFjZSAoQVBJKSBpcyBhIHNldCBvZiBwcm90b2NvbHMsIHJvdXRpbmVzLCBhbmQgdG9vbHMgZm9yIGJ1aWxkaW5nIHNvZnR3YXJlIGFwcGxpY2F0aW9ucy4=";

export const sampleDecodedContent = `---
title: "API"
---

Application Programming Interface (API) is a set of protocols, routines, and tools for building software applications.`;
