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

export async function isForked(octokit, login) {
  try {
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
