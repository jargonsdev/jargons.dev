const headEl = `<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">
  <title>jargons.dev Contributor Setup</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: 'Inter', Arial, sans-serif;
      background: #fff;
      color: #111;
      margin: 0;
      padding: 0;
    }
    h1 {
      justify-content: center;
      align-items: center;
      display: flex;
      gap: 5px;
    }
    img {
      height: 65px;
      filter: drop-shadow(0 4px 3px rgb(0 0 0 / .07)) drop-shadow(0 2px 2px rgb(0 0 0 / .06))
    }
    .text-center {
      text-align: center;
    }
    .setup-tour {
      max-width:700px;
      margin: 2.5rem auto;
      background: #fff;
      border-radius: 14px;
      box-shadow: 0 2px 16px #0002;
      padding: 2.5rem 2rem 2rem 2rem;
      border: 1px solid #2222;
    }
    .setup-tour h1 {
      text-align: center;
      font-size: 2rem;
      margin-bottom: 1.5rem;
      color: #111;
    }
    .steps {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .steps li {
      border-left: 4px solid #bbb;
      margin-left: 2.5rem;
      margin-bottom: 2rem;
      padding: 1rem 1rem 1.5rem 1.2rem;
      position: relative;
      background: #f6f6f6;
      border-radius: 8px;
      border-top-left-radius: 2px;
      border-bottom-left-radius: 2px;
      transition: background 0.2s;
    }
    .steps li.active {
      border-color: #111;
      background: #eaeaea;
    }
    .steps li.done::before {
      border-color: #10b981;
      background: #10b981;
    }
    .steps li::before {
      content: attr(data-step);
      position: absolute;
      left: -3.1rem;
      top: 0;
      background: #111;
      color: #fff;
      width: 2rem;
      height: 2rem;
      border-radius: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.1rem;
      box-shadow: 0 1px 4px #0002;
    }
    .steps h2 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      color: #111;
    }
    .steps p {
      margin: 0 0 1rem 0;
      color: #222;
      line-height: 1.5pc;
    }
    .setup-btn {
      display: inline-block;
      background: #111;  
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 0.7em 1.5em;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      margin-top: 0.5rem;
      transition: background 0.2s;
      text-decoration: none;
    }
    .setup-btn:hover {
      background: #444;
    }
    code, pre {
      background: #222;
      color: #fff;
      border-radius: 5px;
      padding: 0.2em 0.5em;
      font-size: 1em;
      font-family: 'Fira Mono', 'Consolas', monospace;
    }
    .help {
      color: #111;
      font-weight: 500;
      margin-top: 1rem;
    }
    @media (max-width: 600px) {
      .setup-tour { padding: 1rem; }
      .steps li { padding-left: 0.7rem; }
      .steps li::before { left: -3rem; }
    }
  </style>
</head>`

/**
 * Generate the start page HTML content
 * @param {string} registerUrl 
 * @param {string} manifestJson 
 * @returns 
 */
export function getStartPage(registerUrl, manifestJson) {
    return `${headEl}
<body>
  <div class="setup-tour">
  <h1><img src="https://www.jargons.dev/jargons.dev.svg"> <span>Setup</span></h1>
  <p class="text-center">Welcome to the jargons.dev Local development setup guide</p>
    <ol class="steps">
      <li class="active" data-step="1">
        <h2>Start by Registering your GitHub App</h2>
        <p>Click the button below to submit your app manifest to GitHub and start the registration process.</p>
        <p>You will be directed to the GitHub </p>
        <form action="${registerUrl}" method="post">
          <input type="hidden" name="manifest" id="manifest">
          <button type="submit" class="setup-btn">Start now</button>
        </form>
      </li>
    </ol>
    <div class="help">
      Need help? See the <a href="https://github.com/jargonsdev/jargons.dev/blob/main/dev/README.md#setup-script" target="_blank">dev/setup guide</a>.
    </div>
  </div>
  <script>
    const input = document.getElementById("manifest")
    input.value = \`${manifestJson}\`
  </script>
</body>`;
}

/**
 * Generate the next step page HTML content
 * @param {import('../index').AppCredentials} appCredentials
 * @returns 
 */
export function getNextStepPage(appCredentials) {
    return `${headEl}
<body>
  <div class="setup-tour">
  <h1><img src="https://www.jargons.dev/jargons.dev.svg"> <span>Setup</span></h1>
  <p class="text-center">Welcome to the jargons.dev Local development setup guide</p>
    <ol class="steps">
      <li class="done" data-step="✔">
        <h2>Registering your GitHub App</h2>
        <div style="margin-top: 10px; display: flex; align-items: center;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="height: 1.5rem; width: auto;">
                <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd" />
            </svg>
            <span>GitHub App created</span>
        </div>
        <div style="margin-top: 10px; display: flex; align-items: center;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="height: 1.5rem; width: auto;">
                <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd" />
            </svg>
            <span> <code>.env</code> file created</span>
        </div>
        <div style="margin-top: 10px; display: flex; align-items: center;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="height: 1.5rem; width: auto;">
                <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd" />
            </svg>
            <span>GitHub App details added to <code>.env</code> file</span>
        </div>
      </li>
      <li class="active" data-step="2">
        <h2>Create Your Test Repository</h2>
        <p>Create a new github repository with name "jargons.dev-test"</p>
        <a href="https://github.com/new?name=jargons.dev-test" target="_blank" class="setup-btn">Create Test Repo</a>
      </li>
      <li class="active" data-step="3">
        <h2>Update Your <code>.env</code> File</h2>
        <p>
          Copy and paste the repo name in full as value to the <code>PUBLIC_PROJECT_REPO</code> in the <code>.env</code> file created in step 1 <br>
        </p>
        <small>Example (assuming you chose the suggested name, your <code>.env</code> file should have the line below)</small>
        <pre>PUBLIC_PROJECT_REPO="${appCredentials.owner.login}/jargons.dev-test"</pre>
      </li>
      <li class="active" data-step="4">
        <h2>Install the GitHub App</h2>
        <p>
          Follow the link provided after registration to install the app on your test repository.
        </p>
        <a href="${appCredentials.html_url}" target="_blank" class="setup-btn">Install \`${appCredentials.name}\` GitHub App</a>
      </li>
    </ol>
    <div class="help">
      Need help? See the <a href="https://github.com/jargonsdev/jargons.dev/blob/main/dev/README.md#setup-script" target="_blank">dev/setup guide</a>.
    </div>
  </div>
</body>`;
}