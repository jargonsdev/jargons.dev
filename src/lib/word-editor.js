/**
 * Write and add a new word to user's forked dictionary
 * @param {*} userOctokit 
 * @param {{ repoFullname: string, repoBranchRef: string }} forkedRepoDetails 
 * @param {{ title: string, content: string }} word 
 */
export function writeNewWord(userOctokit, forkedRepoDetails, { title, content }) {
  // word - title, content
  // filepath - compute from word.title
  // commitMessage - compute from action
  // 
}

/**
 * Edit and update an existing word in user's forked dictionary
 * @param {*} userOctokit 
 * @param {{ repoFullname: string, repoBranchRef: string }} forkedRepoDetails 
 * @param {{ title: string, content: string, sha: string }} newWord
 */
export function editExistingWord(userOctokit, forkedRepoDetails, { title, content, sha }) {

}

/**
 * Retrieve data for already existing word
 * @param {*} userOctokit 
 * @param {{ repoFullname: string, repoBranchRef: string }} forkedRepoDetails 
 * @param {string} wordTitle 
 */
export function getExistingWord(userOctokit, forkedRepoDetails, wordTitle) {

}