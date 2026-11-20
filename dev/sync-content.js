import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentRepositoryUrl = "https://github.com/jargonsdev/content.git";
const contentBranch = "main";
const checkoutPath = path.join(appRoot, ".content");
const localRepositoryPath = process.env.CONTENT_REPO_PATH;

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

async function verifyContentDirectory(repositoryPath) {
  if (!(await directoryExists(path.join(repositoryPath, "dictionary")))) {
    throw new Error(
      `Expected a dictionary/ directory in content repository: ${repositoryPath}`,
    );
  }
}

async function useLocalRepository() {
  const repositoryPath = path.resolve(appRoot, localRepositoryPath);
  await verifyContentDirectory(repositoryPath);

  const revision = runGit(repositoryPath, ["rev-parse", "--short", "HEAD"]);
  console.log(
    `[content] Using local repository ${repositoryPath} at ${revision}`,
  );
}

async function syncRemoteRepository() {
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
    const repositoryRoot = path.resolve(
      runGit(checkoutPath, ["rev-parse", "--show-toplevel"]),
    );
    if (repositoryRoot !== checkoutPath) {
      throw new Error(
        `${checkoutPath} exists but is not the content repository checkout.`,
      );
    }

    const remoteUrl = runGit(checkoutPath, ["remote", "get-url", "origin"]);
    if (remoteUrl !== contentRepositoryUrl) {
      throw new Error(
        `${checkoutPath} has unexpected origin ${remoteUrl}; expected ${contentRepositoryUrl}.`,
      );
    }

    const changes = runGit(checkoutPath, ["status", "--porcelain"]);
    if (changes) {
      throw new Error(
        `${checkoutPath} has local changes. Use CONTENT_REPO_PATH to read a local content clone instead.`,
      );
    }

    runGit(checkoutPath, ["fetch", "--depth", "1", "origin", contentBranch]);
    runGit(checkoutPath, ["checkout", "--detach", "FETCH_HEAD"]);
  }

  await verifyContentDirectory(checkoutPath);
  const revision = runGit(checkoutPath, ["rev-parse", "--short", "HEAD"]);
  console.log(
    `[content] Synced ${contentRepositoryUrl} (${contentBranch}) at ${revision}`,
  );
}

try {
  if (localRepositoryPath) {
    await useLocalRepository();
  } else {
    await syncRemoteRepository();
  }
} catch (error) {
  console.error(`[content] ${error.message}`);
  process.exitCode = 1;
}
