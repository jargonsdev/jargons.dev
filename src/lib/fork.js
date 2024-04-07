import { getBranch } from "./branch.js";
import { getRepoParts } from "./utils/index.js";

/**
 * Fork the project (specified) Repo to user account
 * @param {import("octokit").Octokit} userOctokit 
 * @param {{ repoFullname: string, repoMainBranchRef: string }} projectRepoDetails 
 */
export async function forkRepository(userOctokit, projectRepoDetails) {
  const { repoFullname, repoMainBranchRef } = projectRepoDetails;
  const { repoOwner, repoName } = getRepoParts(repoFullname);

  try {
    const { data: user } = await userOctokit.request("GET /user");

    const fork = await isRepositoryForked(userOctokit, repoFullname, user.login ); 

    if (fork) {
      console.log("Repo is already forked!");

      const { isUpdated, updateSHA } = await isRepositoryForkUpdated(userOctokit, projectRepoDetails, fork)

      if (!isUpdated) {
        console.log("Repo is outdated!");

        await updateRepositoryFork(userOctokit, fork, { 
          ref: repoMainBranchRef, 
          sha: updateSHA 
        });
      }

      return fork;
    }

    const response = await userOctokit.request("POST /repos/{owner}/{repo}/forks", {
      owner: repoOwner,
      repo: repoName,
    });

    return response.data.full_name;
  } catch (error) {
    console.log("Error occurred while forking repository:", error);
  }
}

/**
 * Update (Sync) repository to state of main (head) repository
 * @param {import("octokit").Octokit} userOctokit 
 * @param {string} fork 
 * @param {{ ref: string, sha: string }} headRepoRef 
 */
async function updateRepositoryFork(userOctokit, fork, headRepoRef) {
  const { repoOwner, repoName } = getRepoParts(fork);
  const { ref, sha } = headRepoRef;
  const formattedRef = ref.split("/")[0] === "refs" 
    ? ref.split("/").slice(1).join("/")
    : ref;

  try {
    await userOctokit.request("PATCH /repos/{owner}/{repo}/git/refs/{ref}", {
      owner: repoOwner,
      repo: repoName,
      ref: formattedRef, //-> `heads/${branchToSync}`
      sha
    });

    console.log("Fork is now updated and in-sync with upstream");
  } catch (error) {
    console.error("Error syncing with upstream:", error.message);
    throw error;
  }
}

/**
 * Check whether a fork is (in Sync with head repo) up-to-date with main repo  
 * @param {import("octokit").Octokit} userOctokit 
 * @param {{ repoFullname: string, repoMainBranchRef: string }} projectRepoDetails 
 * @param {string} fork 
 * @returns {Promise<{ isUpdated: boolean, updateSHA: string }>}
 */
async function isRepositoryForkUpdated(userOctokit, projectRepoDetails, fork) {
  const { repoFullname, repoMainBranchRef } = projectRepoDetails;

  const userForkedBranch = await getBranch(userOctokit, fork, repoMainBranchRef);
  const projectBranch = await getBranch(userOctokit, repoFullname, repoMainBranchRef);

  return {
    isUpdated: userForkedBranch.object.sha === projectBranch.object.sha,
    updateSHA: projectBranch.object.sha
  };
}

/**
 * Check for the presence of a specific repo in a user's fork repo list
 * @param {import("octokit").Octokit} userOctokit 
 * @param {string} repoFullname 
 * @param {string} userLogin 
 * @returns { string | null }
 * 
 * @todo paginate response to get a list of all forks in one call
 */
async function isRepositoryForked(userOctokit, repoFullname, userLogin) {
  try {
    const response = await userOctokit.graphql(`#graphql
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
    `, { 
      login: userLogin 
    });

    const { repoOwner, repoName } = getRepoParts(repoFullname);
    
    const matchingFork = response.user.repositories.nodes.find((fork) => fork.parent && fork.parent.owner.login === repoOwner && fork.parent.name === repoName) 
      ?? null;
    
    return matchingFork ? matchingFork.owner.login + "/" + matchingFork.name : null;
  } catch (error) {
    console.log("Error occurred while checking repo fork: ", error);
  }
}