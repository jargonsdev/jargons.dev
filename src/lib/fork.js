import { getRepoParts } from "./utils/index.js";

/**
 * Fork the dictionry Repo to user account
 * @param {import("octokit").Octokit} octokit 
 * @param {string} repo 
 */
export async function forkRepository(octokit, repo = "babblebey/dictionry") {
  const { repoOwner, repoName } = getRepoParts(repo);

  try {
    // TODO: Replace this Call with Details from Authentication
    const { data: user } = await octokit.request("GET /user");
    console.log(user);

    const { repo: fork, isForked: isDictionryForked } = isForked(octokit, user.login); 
    if (isDictionryForked) {
      // Update - If not upto date
      // TODO: Get fork name programmatically in cases 
      if (!isForkUpdated(octokit, fork)) {
        await updateFork(octokit, fork);
      }
      return;
    }

    const response = await octokit.repos.createFork({
      owner: repoOwner,
      repo: repoName,
    });

    if (response.status === 202) {
      console.log("Forking process initiated successfully!");
    } else {
      console.log("Error occurred while forking repository.");
    }
  } catch (error) {
    console.log("Error occurred while forking repository:", error);
  }
}

async function updateFork(octokit, fork) {
  const { repoOwner, repoName } = getRepoParts(fork);

  try {
    const updatedFork = await octokit.request('PATCH /repos/{owner}/{repo}/git/refs/{ref}', {
      owner: 'OWNER',
      repo: 'REPO',
      // SHOULD BE: `heads/${branchToSync}`
      ref: "heads/beta",
      // SHOULD BE: `refs/remotes/origin/${branchToSync}`
      sha: "refs/remotes/origin/head",
    })

    console.log("Fork is now updated and in-sync with upstream");
  } catch (error) {
    console.error('Error syncing with upstream:', error.message);
    throw error;
  }
}

async function isForkUpdated(octokit, fork) {
  const forkBranch = await getBranch(octokit, fork, "heads/beta");
  // SHOULD BE: Dictionry Repo
  // TODO: replace hardcoded dictionryRepo in "repo" args 
  const dictionryBranch = await getBranch(octokit, "babblebey/insights", "heads/beta");

  return forkBranch.object.sha === dictionryBranch.object.sha;
}

async function getBranch(octokit, repo, branch) {
  const parts = repo.split("/");
  const [ repoOwner, repoName ] = [ parts[0], parts[1] ];

  const response = await octokit.request("GET /repos/{owner}/{repo}/git/ref/{ref}", {
    owner: repoOwner,
    repo: repoName,
    ref: branch,
  });

  return response.data;
}

const getForksQuery = `#graphql
  query forks($login: String!) {
    user (login: $login) { 
      repositories(first: 100, isFork: true) {
        nodes {
          name
          owner {
            login
          }
          parent {
            name
            owner {
              login
            }
          }
        }
      }
    }
  }
`;

async function isForked(octokit, login) {
  try {
    // TODO: paginate response to get a list of all forks in one call
    const response = await octokit.graphql(getForksQuery, { login });

    // SHOULD BE: Dictionry Repo
    // TODO: Setup correct Dictionry Repo for fork Parent comparison
    const repo = "open-sauced/app";
    const { repoOwner, repoName } = getRepoParts(repo);

    const matchingFork = response.user.repositories.nodes.find((fork) => fork.parent && fork.parent.owner.login === repoOwner && fork.parent.name === repoName);

    return {
      repo: matchingFork.owner.login + "/" + matchingFork.name,
      isForked: matchingFork !== undefined
    };
  } catch (error) {
    console.log("Error occurred while checking repo fork: ", error);
  }
}

export {
  isForkUpdated,
  isForked,
  updateFork,
  getBranch
}
