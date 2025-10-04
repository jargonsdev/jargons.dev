import { request } from "@octokit/request";
import { components } from "@octokit/openapi-types";

export default function registerGitHubApp(
  manifest?: Manifest,
  metaOptions?: MetaOptions,
): Promise<AppCredentials>;

export type Manifest = {
  /** Organization login. If not set, the app will be registered on the user's account */
  org?: string;
  /** The name of the GitHub App. */
  name?: string;
  /** A description of the GitHub App. */
  description?: string;
  /** The homepage of your GitHub App. If `org` is set, `homepageUrl` will default to `https://github.com/{org}`, otherwise to `https://github.com` */
  url: string;
  /** The configuration of the GitHub App's webhook. */
  hook_attributes?: {
    /*
     * __Required.__ The URL of the server that will receive the webhook POST requests.
     */
    url: string;
    /*
     * Deliver event details when this hook is triggered, defaults to true.
     */
    active?: boolean;
  };
  /** The full URL to redirect to after a user initiates the registration of a GitHub App from a manifest. */
  redirect_url?: string;
  /** A full URL to redirect to after someone authorizes an installation. You can provide up to 10 callback URLs. */
  callback_urls?: string[];
  /** A full URL to redirect users to after they install your GitHub App if additional setup is required. */
  setup_url?: string;
  /** Set to `true` when your GitHub App is available to the public or `false` when it is only accessible to the owner of the app. */
  public?: boolean;
  /** The list of events the GitHub App subscribes to. */
  default_events?: string[];
  /** The set of permissions needed by the GitHub App. The format of the object uses the permission name for the key (for example, `issues`) and the access type for the value (for example, `write`). */
  default_permissions?: Record<string, string>;
  /** Set to `true` to request the user to authorize the GitHub App, after the GitHub App is installed. */
  request_oauth_on_install?: boolean;
  /** Set to `true` to redirect users to the setup_url after they update your GitHub App installation. */
  setup_on_update?: boolean;
};

export type MetaOptions = {
  /** Port number for local server. Defaults to a random available port number */
  port?: number;

  /** GitHub website URL. Defaults to `https://github.com` */
  githubUrl?: string;

  /** GitHub API base URL. Defaults to `https://api.github.com` */
  githubApiUrl?: string;

  /** message to be used for logging. Defaults to `console.log` */
  log?: Console["log"];

  /** custom `octokit.request` method */
  request?: typeof request;
};

export type AppCredentials = components["schemas"]["integration"];
