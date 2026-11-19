import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../src/lib/octokit/app.js", () => ({
  default: {
    oauth: { octokit: { request: vi.fn() } },
    getUserOctokit: vi.fn(),
    octokit: { request: vi.fn() },
  },
}));

vi.mock("../../../src/lib/fork.js", () => ({
  forkRepository: vi.fn(),
  getForkStatus: vi.fn(),
}));

vi.mock("../../../src/lib/branch.js", () => ({
  createBranch: vi.fn(),
  deleteBranch: vi.fn(),
}));

vi.mock("../../../src/lib/word-editor.js", () => ({
  updateExistingWord: vi.fn(),
  writeNewWord: vi.fn(),
}));

vi.mock("../../../src/lib/submit-word.js", () => ({
  submitWord: vi.fn(),
}));

import app from "../../../src/lib/octokit/app.js";
import { createBranch } from "../../../src/lib/branch.js";
import { forkRepository, getForkStatus } from "../../../src/lib/fork.js";
import { submitWord } from "../../../src/lib/submit-word.js";
import { writeNewWord } from "../../../src/lib/word-editor.js";
import { POST } from "../../../src/pages/api/dictionary.js";

function createContext() {
  const formData = new FormData();
  formData.set("title", "Test Word");
  formData.set("content", "A test definition.");
  formData.set("action", "new");
  formData.set("metadata", "{}");

  return {
    request: { formData: async () => formData },
    cookies: { get: () => ({ value: "token" }) },
  };
}

describe("dictionary submission fork readiness", () => {
  let userOctokit;

  beforeEach(() => {
    vi.clearAllMocks();
    userOctokit = { request: vi.fn(), graphql: vi.fn() };
    app.oauth.octokit.request.mockResolvedValue({ status: 200 });
    app.getUserOctokit.mockReturnValue(userOctokit);
  });

  it("rejects an outdated fork without syncing or creating a branch", async () => {
    getForkStatus.mockResolvedValue({
      status: "out-of-date",
      fork: "user/jargons.dev",
    });

    const response = await POST(createContext());

    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({ status: "out-of-date" });
    expect(forkRepository).not.toHaveBeenCalled();
    expect(createBranch).not.toHaveBeenCalled();
  });

  it("creates a missing fork through first submission", async () => {
    getForkStatus
      .mockResolvedValueOnce({ status: "missing", fork: null })
      .mockResolvedValueOnce({ status: "current", fork: "user/jargons.dev" });
    forkRepository.mockResolvedValue("user/jargons.dev");
    createBranch.mockResolvedValue({ ref: "refs/heads/add-test-word" });
    writeNewWord.mockResolvedValue({ content: { sha: "word-sha" } });
    submitWord.mockResolvedValue({ number: 123 });

    const response = await POST(createContext());

    expect(response.status).toBe(200);
    expect(forkRepository).toHaveBeenCalledOnce();
    expect(createBranch).toHaveBeenCalledOnce();
    expect(writeNewWord).toHaveBeenCalledOnce();
    expect(submitWord).toHaveBeenCalledOnce();
  });
});
