#!/usr/bin/env node

/**
 * Format staged files script
 * Works cross-platform without external dependencies
 */

import { execSync } from "child_process";
import { existsSync } from "fs";

try {
  // Get staged files
  const stagedFiles = execSync(
    "git diff --cached --name-only --diff-filter=ACMR",
    {
      encoding: "utf8",
    },
  )
    .trim()
    .split("\n")
    .filter(Boolean);

  if (stagedFiles.length === 0) {
    console.log("No staged files to format.");
    process.exit(0);
  }

  // Filter for supported file types
  const supportedExtensions = [
    ".js",
    ".ts",
    ".jsx",
    ".tsx",
    ".astro",
    ".json",
    ".css",
    ".md",
  ];
  const filesToFormat = stagedFiles.filter((file) => {
    // Check if file exists (in case it was deleted)
    if (!existsSync(file)) return false;

    // Check if file has supported extension
    return supportedExtensions.some((ext) => file.endsWith(ext));
  });

  if (filesToFormat.length === 0) {
    console.log("No staged files need formatting.");
    process.exit(0);
  }

  console.log(`Formatting ${filesToFormat.length} staged file(s):`);
  filesToFormat.forEach((file) => console.log(`  - ${file}`));

  // Format the files
  const command = `prettier --write ${filesToFormat.map((f) => `"${f}"`).join(" ")}`;
  execSync(command, { stdio: "inherit" });

  console.log("✅ Staged files formatted successfully!");
} catch (error) {
  console.error("❌ Error formatting staged files:", error.message);
  process.exit(1);
}
