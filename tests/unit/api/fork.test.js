import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../src/lib/octokit/app.js", () => ({
  default: {
    oauth: { octokit: { request: vi.fn() } },
    getUserOctokit: vi.fn(),
  },
}));

vi.mock("../../../src/lib/fork.js", () => ({
  getForkStatus: vi.fn(),
  syncForkRepository: vi.fn(),
}));

import app from "../../../src/lib/octokit/app.js";
import { getForkStatus, syncForkRepository } from "../../../src/lib/fork.js";
import { GET, POST } from "../../../src/pages/api/fork.js";

describe("fork API", () => {
  let userOctokit;

  beforeEach(() => {
    vi.clearAllMocks();
    userOctokit = { request: vi.fn(), graphql: vi.fn() };
    app.oauth.octokit.request.mockResolvedValue({ status: 200 });
    app.getUserOctokit.mockReturnValue(userOctokit);
  });

  it("returns fork status for an authenticated user", async () => {
    getForkStatus.mockResolvedValue({
      status: "out-of-date",
      fork: "user/repo",
    });

    const response = await GET({
      cookies: { get: () => ({ value: "token" }) },
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      status: "out-of-date",
      fork: "user/repo",
    });
    expect(getForkStatus).toHaveBeenCalledWith(
      userOctokit,
      expect.objectContaining({ repoFullname: expect.any(String) }),
    );
  });

  it("requires authentication for status and sync requests", async () => {
    const context = { cookies: { get: () => undefined } };

    const statusResponse = await GET(context);
    const syncResponse = await POST(context);

    expect(statusResponse.status).toBe(401);
    expect(syncResponse.status).toBe(401);
    expect(app.oauth.octokit.request).not.toHaveBeenCalled();
    expect(getForkStatus).not.toHaveBeenCalled();
    expect(syncForkRepository).not.toHaveBeenCalled();
  });

  it("syncs only through the explicit POST action", async () => {
    syncForkRepository.mockResolvedValue({
      status: "current",
      fork: "user/repo",
    });

    const response = await POST({
      cookies: { get: () => ({ value: "token" }) },
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      status: "current",
      fork: "user/repo",
    });
    expect(syncForkRepository).toHaveBeenCalledWith(
      userOctokit,
      expect.objectContaining({ repoFullname: expect.any(String) }),
    );
  });
});
