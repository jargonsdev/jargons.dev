# Contributing Guide

We welcome contributions of any size and skill level. Before contributing,
please read the [Code of Conduct](./code-of-conduct.md) and follow the directions below:

> [!Tip] 
> **New contributors:** Take a look at [https://github.com/firstcontributions/first-contributions](https://github.com/firstcontributions/first-contributions) for helpful information on contributing

## Recommended Communication Style

1. Always leave screenshots for visual changes.
2. Always leave a detailed description in the pull request. Leave nothing ambiguous for the reviewer.
3. Always review your code first. Run the project locally and test it before requesting a review.
4. Always communicate in the GitHub repository. Whether in the issue or the pull request, keeping the lines of communication open and visible to everyone on the team helps everyone around you.

## Contributing (New/Edit) Words to the Dictionary

Contributing new or edited words to the dictionary!? there are two primary ways you can contribute new words or edit existing ones:

1. **Using the Jargons Editor (Highly Recommended):**  
   The Jargons Editor is a user-friendly interface built to simplify the contribution process. You can add new words or edit existing ones directly through the visual editor. Visit [jargons.dev/editor](https://jargons.dev/editor) to get started.

2. **Using GitHub UI or Other Means:**  
   If you prefer to use the GitHub UI or other means, you can follow these steps:
   
   - **For New Words:**
     1. Grab our predefined word template below
        ```md
        ---
        layout: ../../layouts/word.astro
        title: "title_here"
        ---
        content_here
        ```
     2. Fill in the word details in the template, ensuring accuracy and clarity.
     3. Create a new file for the word in the `src/content/dictionary` folder.
     4. Name the file in a slug format, e.g., `new-word.mdx`.
     5. Submit your file as a pull request to the `main` branch of our repository.

   - **For Editing Existing Words:**
     1. Locate the existing file for the word you wish to edit in the `src/content/dictionary` folder.
     2. Make your edits directly to the file.
     3. Submit your changes as a pull request to the `main` branch of our repository.

## Contributing Issues & Pull Requests (PR)

For contributions other than adding or editing words in the dictionary, please refer to the guidelines below.

### Creating an Issue

To create an Issue, please follow these steps:

1. Search existing Issues before creating a new issue (to see if someone raised this already)
2. If it doesn't exist create a new issue giving as much context as possible (please select the correct Issue type, for example `bug` or `feature`)
3. If you wish to work on the Issue, Select the checkbox "I will like to work on this issue". 

### Working on an Issue

If you wish to work on an open issue, please ask for it to be assigned to you and it will be assigned to you.

> [!IMPRORTANT]  
> Only start working on an Issue (and open a Pull Request) when it has been assigned to you - this will prevent confusion, multiple people working on the same issue and work not being used

In case you get stuck while working on an issue you've been assigned, feel free to ask question openly in the comment.

Please follow our [Code of Conduct](./code-of-conduct.md) in all your interactions with the project and its contributors.

### Pull Requests (PR)

We actively welcome your pull requests. However, you must ensure that **you are assigned** to an existing issue before working on a pull request, and you need to **link your work to the issue** in your PR form.

1. Fork and clone the repo.
2. Creating a new branch is a must. Before working on your changes, create a new branch from the default (`main`, `beta`, etc.) branch. Name your branch with something descriptive of your work, i.e., `add-navbar` or `fix/broken-links`.
3. If you've added code that should be tested, add tests.
4. If you've changed APIs, update the documentation.
5. If you make visual changes, screenshots are required.
6. Ensure the test suite passes.
7. Make sure you address any lint warnings.
8. If you improve the existing code or added a new npm package, please let us know in your PR description.
9. Completing the PR form is required. Make sure to fill in the PR title, description, [link to an issue](https://help.github.com/en/github/writing-on-github/autolinked-references-and-urls), and all the necessary areas.

   - The title must begin with `feat:`, `fix:`, or anything related to your changes. <br /> **TIP:** You can follow your chosen option when [committing](#commits) your changes.

   - Unsolicited code is welcomed, but an issue is required to announce your intentions.

#### Work in Progress

GitHub supports [draft pull requests](https://github.blog/2019-02-14-introducing-draft-pull-requests/), which will disable the merge button until the PR is marked as ready for merge.

#### Additional Resources

- _[3 tips for getting your Pull Request reviewed on GitHub](https://youtu.be/cuMeC-eZJJ4)_

## Getting Started

To contribute to jargons.dev, follow these steps:

### Setting Up Projects Locally

1. [Fork](https://docs.github.com/en/get-started/quickstart/fork-a-repo) the repository to your own GitHub account.
2. Clone the forked repository to your local machine.
3. Check the project's [README](./README.md) to learn more on how to run the project locally.

### Building

To generate a production-ready version of your code, run:

```shell
npm run build
```

## License

By contributing to the jargons.dev project, you agree that your contributions will be licensed
by a specific License. You can find this information in the `LICENSE` file of the repo you are contributing to.

## Credits

This document was created picking some ideas from the ones listed below

- https://github.com/open-sauced/docs/blob/main/docs/contributing/introduction-to-contributing.md
- https://github.com/EddieHubCommunity/BioDrop/blob/main/CONTRIBUTING.md