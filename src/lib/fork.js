import { getRepoParts } from "./utils/index.js";

/**
 * Fork the dictionry Repo to user account
 * @param {import("octokit").Octokit} userOctokit 
 * @param {{ repoFullname: string, repoMainBranchRef: string }} repo 
 */
export async function forkRepository(userOctokit, repoDetails) {
  const { repoFullname, repoMainBranchRef } = repoDetails;
  const { repoOwner, repoName } = getRepoParts(repoFullname);

  try {
    const { data: user } = await userOctokit.request("GET /user");
    // console.log(user);

    const { repo: fork } = await isRepositoryForked(userOctokit, { 
      repoFullname, 
      user: user.login 
    }); 

    if (!!fork) {
      console.log("Repo is already forked!")
      if (!isRepositoryForkUpdated(userOctokit, repoDetails, fork)) {
        await updateRepositoryFork(userOctokit, repoMainBranchRef, fork);
        console.log("Repo was also outdated and immeidately updated")
      }
      return;
    }

    const response = await userOctokit.request("POST /repos/{owner}/{repo}/forks", {
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

async function updateRepositoryFork(userOctokit, headBranchRef, fork) {
  const { repoOwner, repoName } = getRepoParts(fork);

  try {
    const updatedFork = await userOctokit.request("PATCH /repos/{owner}/{repo}/git/refs/{ref}", {
      owner: repoOwner,
      repo: repoName,
      ref: headBranchRef, //-> `heads/${branchToSync}`
      sha: "refs/remotes/origin/head", //-> `refs/remotes/origin/${branchToSync}`
    })

    console.log("Fork is now updated and in-sync with upstream");
  } catch (error) {
    console.error("Error syncing with upstream:", error.message);
    throw error;
  }
}

async function isRepositoryForkUpdated(userOctokit, repoDetails, fork) {
  const { repoFullname, repoMainBranchRef } = repoDetails;

  const userForkedBranch = await getBranch(userOctokit, fork, repoMainBranchRef);
  const projectBranch = await getBranch(userOctokit, repoFullname, repoMainBranchRef);

  return userForkedBranch.object.sha === projectBranch.object.sha;
}

async function getBranch(userOctokit, repo, ref) {
  const { repoOwner, repoName } = getRepoParts(repo);

  const response = await userOctokit.request("GET /repos/{owner}/{repo}/git/ref/{ref}", {
    owner: repoOwner,
    repo: repoName,
    ref: ref,
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

async function isRepositoryForked(userOctokit, { repoFullname, user: login }) {
  try {
    // TODO: paginate response to get a list of all forks in one call
    const response = await userOctokit.graphql(getForksQuery, { login });
    const { repoOwner, repoName } = getRepoParts(repoFullname);
    const matchingFork = response.user.repositories.nodes.find((fork) => fork.parent && fork.parent.owner.login === repoOwner && fork.parent.name === repoName) 
      ?? null;
    
    return {
      repo: matchingFork ? matchingFork.owner.login + "/" + matchingFork.name : null
    };
  } catch (error) {
    console.log("Error occurred while checking repo fork: ", error);
  }
}

export {
  isRepositoryForkUpdated,
  isRepositoryForked,
  updateRepositoryFork,
  getBranch
}
