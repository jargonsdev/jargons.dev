import { map } from "nanostores";

/** @template { import("@octokit/types").Endpoints["GET /user"]["response"]["data"] } UserData */

/** @type {import('nanostores').MapStore<Record<string, UserData>>} */
export const $userData = map({})