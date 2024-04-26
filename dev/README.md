### <tt>jargons.dev</tt> Dev Setup Script

This script streamlines the process of creating a GitHub App required to run jargons.dev locally and sets up the environment file (.env) for you. Here's how to use it:

1. **Run the Setup Script:**
   - Run `npm run setup` in your terminal to start the setup process.

2. **Enter App Name:**
   - You will be prompted to enter an app name. The default app name is `jargons.dev-app-for-`, which you should append with your GitHub username to make it unique, example: `jargons.dev-app-for-babblebey`.

3. **Create a New GitHub Repository:**
   - Manually create a new GitHub repository with the name "jargons.dev-test" at [https://github.com/new](https://github.com/new).

4. **Update the Environment Variables:**
   - Once the app is created, the script will create a `.env` file with the necessary variables.
   - Open the `.env` file and replace the value of `PUBLIC_PROJECT_REPO` with your newly created repository's name. Example: `PUBLIC_PROJECT_REPO="your-username/jargons.dev-test"`

5. **Install the GitHub App:**
   - Follow the link provided in the script output to install the GitHub App on your repository.

This script simplifies the setup process for running <tt>jargons.dev</tt> locally and ensures that your GitHub App is configured correctly. If you encounter any issues during setup, please reach out or craeting an issue.