import { http, HttpResponse, graphql } from "msw";
import {
  prCreationResponse,
  editPrCreationResponse,
  labelResponse,
  branchCreationResponse,
  branchGetResponse,
  contentCreationResponse,
  contentUpdateResponse,
  contentGetResponse,
  forkCreationResponse,
  userResponse,
  graphqlForksResponse,
} from "../fixtures/github-responses/index.js";

// GitHub API base URL
const GITHUB_API_BASE = "https://api.github.com";

export const githubHandlers = [
  // User information
  http.get(`${GITHUB_API_BASE}/user`, () => {
    return HttpResponse.json(userResponse);
  }),

  // Pull Request creation
  http.post(
    `${GITHUB_API_BASE}/repos/:owner/:repo/pulls`,
    ({ params, request }) => {
      const { owner, repo } = params;

      // Simulate different responses based on title
      return new Promise((resolve) => {
        request.json().then((body) => {
          if (body.title?.includes("Edit word:")) {
            resolve(HttpResponse.json(editPrCreationResponse));
          } else {
            resolve(HttpResponse.json(prCreationResponse));
          }
        });
      });
    },
  ),

  // Label addition to PR/Issue
  http.post(
    `${GITHUB_API_BASE}/repos/:owner/:repo/issues/:issue_number/labels`,
    () => {
      return HttpResponse.json([labelResponse]);
    },
  ),

  // Branch creation
  http.post(`${GITHUB_API_BASE}/repos/:owner/:repo/git/refs`, ({ request }) => {
    return new Promise((resolve) => {
      request.json().then((body) => {
        if (body.ref === "refs/heads/existing-branch") {
          // Simulate "Reference already exists" error
          resolve(
            new HttpResponse(
              JSON.stringify({
                message: "Reference already exists",
                documentation_url: "https://docs.github.com/rest",
              }),
              { status: 422 },
            ),
          );
        } else {
          resolve(
            HttpResponse.json({
              ...branchCreationResponse,
              ref: body.ref,
            }),
          );
        }
      });
    });
  }),

  // Get branch/ref
  http.get(
    `${GITHUB_API_BASE}/repos/:owner/:repo/git/ref/:ref`,
    ({ params }) => {
      const { ref } = params;

      if (ref === "heads/non-existent-branch") {
        return new HttpResponse(
          JSON.stringify({
            message: "Not Found",
            documentation_url: "https://docs.github.com/rest",
          }),
          { status: 404 },
        );
      }

      return HttpResponse.json(branchGetResponse);
    },
  ),

  // Delete branch
  http.delete(
    `${GITHUB_API_BASE}/repos/:owner/:repo/git/refs/:ref`,
    ({ params }) => {
      const { ref } = params;

      if (ref === "heads/non-existent-branch") {
        return new HttpResponse(
          JSON.stringify({
            message: "Not Found",
            documentation_url: "https://docs.github.com/rest",
          }),
          { status: 404 },
        );
      }

      return new HttpResponse(null, { status: 204 });
    },
  ),

  // Create/Update file content
  http.put(
    `${GITHUB_API_BASE}/repos/:owner/:repo/contents/:path`,
    ({ request, params }) => {
      const { path } = params;

      return new Promise((resolve) => {
        request.json().then((body) => {
          if (path === "src/content/dictionary/error-test.mdx") {
            resolve(
              new HttpResponse(
                JSON.stringify({
                  message: "Invalid request",
                  documentation_url: "https://docs.github.com/rest",
                }),
                { status: 400 },
              ),
            );
          }

          // Check if this is an update (has sha) or creation
          const response = body.sha
            ? contentUpdateResponse
            : contentCreationResponse;
          resolve(HttpResponse.json(response));
        });
      });
    },
  ),

  // Get file content
  http.get(
    `${GITHUB_API_BASE}/repos/:owner/:repo/contents/:path`,
    ({ params }) => {
      const { path } = params;

      if (path === "src/content/dictionary/non-existent.mdx") {
        return new HttpResponse(
          JSON.stringify({
            message: "Not Found",
            documentation_url: "https://docs.github.com/rest",
          }),
          { status: 404 },
        );
      }

      return HttpResponse.json(contentGetResponse);
    },
  ),

  // Fork repository
  http.post(`${GITHUB_API_BASE}/repos/:owner/:repo/forks`, () => {
    return HttpResponse.json(forkCreationResponse);
  }),

  // Update fork (sync with upstream)
  http.patch(`${GITHUB_API_BASE}/repos/:owner/:repo/git/refs/:ref`, () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // GraphQL endpoint for fork detection
  graphql.query("forks", () => {
    return HttpResponse.json({
      data: graphqlForksResponse,
    });
  }),

  // Error simulation handlers
  http.post(`${GITHUB_API_BASE}/repos/error/test/pulls`, () => {
    return new HttpResponse(
      JSON.stringify({
        message: "Bad credentials",
        documentation_url: "https://docs.github.com/rest",
      }),
      { status: 401 },
    );
  }),

  http.post(`${GITHUB_API_BASE}/repos/network/error/pulls`, () => {
    return HttpResponse.error();
  }),
];

// Error response helpers
export const createErrorResponse = (status, message) => {
  return new HttpResponse(
    JSON.stringify({
      message,
      documentation_url: "https://docs.github.com/rest",
    }),
    { status },
  );
};

export const createNetworkError = () => {
  return HttpResponse.error();
};
