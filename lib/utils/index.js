export function getRepoParts(repo) {
  const parts = repo.split("/");
  const [ repoOwner, repoName ] = [ parts[0], parts[1] ];

  return {
    repoOwner,
    repoName
  }
}