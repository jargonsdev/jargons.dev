/**
 * Fork the dictionry Repo to user account
 * @param {import("octokit").Octokit} octokit 
 * @param {string} repo 
 */
export async function forkRepository(octokit, repo = "babblebey/dictionry") {
  const parts = repo.split("/");
  const [ repoOwner, repoName ] = [ parts[0], parts[2] ];

  try {
    // TODO: Replace this Call with Details from Authentication
    const { data: user } = await octokit.request("GET /user");
    console.log(user);

    if (isForked(octokit, user.login)) {
      // Update - If not upto date
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

async function updateFork(octokit) {
  const repo = "babblebey/insights";
  const parts = repo.split("/");
  const [ repoOwner, repoName ] = [ parts[0], parts[1] ];
  await octokit.request('GET /repos/{owner}/{repo}/git/matching-refs/{ref}', {
    owner: repoOwner,
    repo: repoName,
    // TODO: Replace branch name "ref" with users'
    ref: "heads/beta"
  });
}

async function isForkUpdated(octokit) {
  // TODO: Replace Fork "repo" argument with users' 
  // TODO: Fill correct repo name
  const forkBranch = await getBranch(octokit, "open-sauced/app", "heads/beta");
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

async function isForked(octokit, login) {
  try {
    // TODO: paginate response to get a list of all forks in one call
    const response = await octokit.graphql(`#graphql
      query forks($login: String!) {
        user (login: $login) { 
          repositories(first: 100, isFork: true) {
            nodes {
              name
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
    `, { login });

    const repo = "open-sauced/app";
    const parts = repo.split("/");
    const [ repoOwner, repoName ] = [ parts[0], parts[1] ];

    // console.log(response.user.repositories.nodes.forEach(f => console.log(f)));

    const matchingFork = response.user.repositories.nodes.find((fork) => fork.parent && fork.parent.owner.login === repoOwner && fork.parent.name === repoName);

    return matchingFork !== undefined;
  } catch (error) {
    console.log("Error occurred checking repo fork status:", error);
  }
}

export {
  isForkUpdated,
  isForked,
  updateFork,
  getBranch
}
