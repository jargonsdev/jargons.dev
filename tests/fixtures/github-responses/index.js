// GitHub API response fixtures for testing
export const prCreationResponse = {
  id: 123456789,
  number: 456,
  title: "Add new word: API",
  body: "This PR adds the definition for 'API' to the dictionary.",
  state: "open",
  html_url: "https://github.com/jargonsdev/jargons.dev/pull/456",
  user: {
    login: "testuser",
    id: 987654321,
  },
  head: {
    ref: "add-word-api",
    sha: "abc123def456",
  },
  base: {
    ref: "main",
    sha: "def456ghi789",
  },
  created_at: "2025-09-06T10:00:00Z",
  updated_at: "2025-09-06T10:00:00Z",
};

export const editPrCreationResponse = {
  id: 123456790,
  number: 457,
  title: "Edit word: API",
  body: "This PR updates the definition for 'API' in the dictionary.",
  state: "open",
  html_url: "https://github.com/jargonsdev/jargons.dev/pull/457",
  user: {
    login: "testuser",
    id: 987654321,
  },
  head: {
    ref: "edit-word-api",
    sha: "ghi789jkl012",
  },
  base: {
    ref: "main",
    sha: "def456ghi789",
  },
  created_at: "2025-09-06T10:05:00Z",
  updated_at: "2025-09-06T10:05:00Z",
};

export const labelResponse = {
  id: 208045946,
  node_id: "MDU6TGFiZWwyMDgwNDU5NDY=",
  name: "🆕 new-word",
  color: "0366d6",
  default: false,
  description: "New word addition",
};

export const branchCreationResponse = {
  ref: "refs/heads/add-word-api",
  node_id: "MDM6UmVmMTI5NjI2OTQ4OnJlZnMvaGVhZHMvYWRkLXdvcmQtYXBp",
  url: "https://api.github.com/repos/testuser/jargons.dev/git/refs/heads/add-word-api",
  object: {
    sha: "abc123def456",
    type: "commit",
    url: "https://api.github.com/repos/testuser/jargons.dev/git/commits/abc123def456",
  },
};

export const branchGetResponse = {
  ref: "refs/heads/main",
  node_id: "MDM6UmVmMTI5NjI2OTQ4OnJlZnMvaGVhZHMvbWFpbg==",
  url: "https://api.github.com/repos/testuser/jargons.dev/git/refs/heads/main",
  object: {
    sha: "def456ghi789",
    type: "commit",
    url: "https://api.github.com/repos/testuser/jargons.dev/git/commits/def456ghi789",
  },
};

export const contentCreationResponse = {
  content: {
    name: "api.mdx",
    path: "src/content/dictionary/api.mdx",
    sha: "jkl012mno345",
    size: 1234,
    url: "https://api.github.com/repos/testuser/jargons.dev/contents/src/content/dictionary/api.mdx",
    html_url:
      "https://github.com/testuser/jargons.dev/blob/add-word-api/src/content/dictionary/api.mdx",
    git_url:
      "https://api.github.com/repos/testuser/jargons.dev/git/blobs/jkl012mno345",
    download_url:
      "https://raw.githubusercontent.com/testuser/jargons.dev/add-word-api/src/content/dictionary/api.mdx",
    type: "file",
  },
  commit: {
    sha: "mno345pqr678",
    message: 'word: commit to "API"',
  },
};

export const contentUpdateResponse = {
  content: {
    name: "api.mdx",
    path: "src/content/dictionary/api.mdx",
    sha: "pqr678stu901",
    size: 1456,
    url: "https://api.github.com/repos/testuser/jargons.dev/contents/src/content/dictionary/api.mdx",
    html_url:
      "https://github.com/testuser/jargons.dev/blob/edit-word-api/src/content/dictionary/api.mdx",
    git_url:
      "https://api.github.com/repos/testuser/jargons.dev/git/blobs/pqr678stu901",
    download_url:
      "https://raw.githubusercontent.com/testuser/jargons.dev/edit-word-api/src/content/dictionary/api.mdx",
    type: "file",
  },
  commit: {
    sha: "stu901vwx234",
    message: 'word: edit commit to "API"',
  },
};

export const contentGetResponse = {
  name: "api.mdx",
  path: "src/content/dictionary/api.mdx",
  sha: "vwx234yza567",
  size: 1234,
  url: "https://api.github.com/repos/testuser/jargons.dev/contents/src/content/dictionary/api.mdx",
  html_url:
    "https://github.com/testuser/jargons.dev/blob/main/src/content/dictionary/api.mdx",
  git_url:
    "https://api.github.com/repos/testuser/jargons.dev/git/blobs/vwx234yza567",
  download_url:
    "https://raw.githubusercontent.com/testuser/jargons.dev/main/src/content/dictionary/api.mdx",
  type: "file",
  content:
    "LS0tCnRpdGxlOiAiQVBJIgotLS0KCkFwcGxpY2F0aW9uIFByb2dyYW1taW5nIEludGVyZmFjZSAoQVBJKSBpcyBhIHNldCBvZiBwcm90b2NvbHMsIHJvdXRpbmVzLCBhbmQgdG9vbHMgZm9yIGJ1aWxkaW5nIHNvZnR3YXJlIGFwcGxpY2F0aW9ucy4=",
  encoding: "base64",
};

export const forkCreationResponse = {
  id: 567890123,
  name: "jargons.dev",
  full_name: "testuser/jargons.dev",
  owner: {
    login: "testuser",
    id: 987654321,
  },
  private: false,
  fork: true,
  parent: {
    id: 123456789,
    name: "jargons.dev",
    full_name: "jargonsdev/jargons.dev",
    owner: {
      login: "jargonsdev",
      id: 456789012,
    },
  },
  created_at: "2025-09-06T10:00:00Z",
  updated_at: "2025-09-06T10:00:00Z",
};

export const userResponse = {
  login: "testuser",
  id: 987654321,
  name: "Test User",
  email: "test@example.com",
};

export const graphqlForksResponse = {
  user: {
    repositories: {
      nodes: [
        {
          name: "jargons.dev",
          owner: {
            login: "testuser",
          },
          parent: {
            name: "jargons.dev",
            owner: {
              login: "jargonsdev",
            },
          },
        },
      ],
    },
  },
};
