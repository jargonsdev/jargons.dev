import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checkoutPath = path.join(appRoot, ".content");

function getContentRepositoryConfiguration() {
  const contentRepository = process.env.PUBLIC_PROJECT_REPO;
  if (
    !contentRepository ||
    !/^[\w.-]+\/[\w.-]+$/.test(contentRepository)
  ) {
    throw new Error(
      "PUBLIC_PROJECT_REPO must be set to a GitHub owner/repository value.",
    );
  }

  const contentBranchRef = process.env.PUBLIC_PROJECT_REPO_BRANCH_REF ?? "";
  const contentBranchMatch = /^refs\/heads\/(.+)$/.exec(contentBranchRef);
  if (!contentBranchMatch) {
    throw new Error(
      "PUBLIC_PROJECT_REPO_BRANCH_REF must be a refs/heads/<branch> value.",
    );
  }

  return {
    contentRepository,
    contentRepositoryUrl: `https://github.com/${contentRepository}.git`,
    contentBranch: contentBranchMatch[1],
  };
}

function runGit(repositoryPath, args) {
  return execFileSync("git", args, {
    cwd: repositoryPath,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

async function directoryExists(directoryPath) {
  try {
    return (await fs.stat(directoryPath)).isDirectory();
  } catch {
    return false;
  }
}

async function verifyContentDirectory(contentRepositoryPath) {
  if (
    !(await directoryExists(path.join(contentRepositoryPath, "dictionary")))
  ) {
    throw new Error(
      `Expected a dictionary/ directory in content repository: ${contentRepositoryPath}`,
    );
  }
}

async function syncContentRepository() {
  const { contentRepository, contentRepositoryUrl, contentBranch } =
    getContentRepositoryConfiguration();

  if (!(await directoryExists(checkoutPath))) {
    execFileSync(
      "git",
      [
        "clone",
        "--depth",
        "1",
        "--single-branch",
        "--branch",
        contentBranch,
        contentRepositoryUrl,
        checkoutPath,
      ],
      { cwd: appRoot, stdio: "inherit" },
    );
  } else {
    const contentRepositoryRoot = path.resolve(
      runGit(checkoutPath, ["rev-parse", "--show-toplevel"]),
    );
    if (contentRepositoryRoot !== checkoutPath) {
      throw new Error(
        `${checkoutPath} exists but is not the content repository checkout.`,
      );
    }

    const changes = runGit(checkoutPath, ["status", "--porcelain"]);
    if (changes) {
      throw new Error(
        `${checkoutPath} has local changes. Refusing to update the remote content checkout.`,
      );
    }

    const remoteContentRepositoryUrl = runGit(checkoutPath, [
      "remote",
      "get-url",
      "origin",
    ]);
    if (remoteContentRepositoryUrl !== contentRepositoryUrl) {
      runGit(checkoutPath, [
        "remote",
        "set-url",
        "origin",
        contentRepositoryUrl,
      ]);
    }

    runGit(checkoutPath, [
      "fetch",
      "--depth",
      "1",
      "origin",
      contentBranch,
    ]);
    runGit(checkoutPath, ["checkout", "--detach", "FETCH_HEAD"]);
  }

  await verifyContentDirectory(checkoutPath);
  const revision = runGit(checkoutPath, ["rev-parse", "HEAD"]);
  const revisionManifest = {
    repository: contentRepository,
    branch: contentBranch,
    sha: revision,
  };
  await fs.writeFile(
    path.join(appRoot, "public", "content-revision.json"),
    `${JSON.stringify(revisionManifest, null, 2)}\n`,
  );

  console.log(
    `[content] Synced ${contentRepositoryUrl} (${contentBranch}) at ${revision.slice(0, 7)}`,
  );
}

try {
  await syncContentRepository();
} catch (error) {
  console.error(`[content] ${error.message}`);
  process.exitCode = 1;
}
