import { getCollection } from "astro:content";

/**
 * Get all jargons (word) from the dictionary
 * @param {import("astro").APIContext} context
 *
 * @todo implement pagination
 * @todo Nice to have: endpoint queries the GitHub to fetch words directly from jargons.dev repo using the requester's accessToken
 * ... will be super useful in the context where we are consuming the endpoint on the anticipated browser extension integrations
 */
export async function GET() {
  const dictionary = await getCollection("dictionary");
  const response = dictionary.map((word) => {
    return {
      slug: word.slug,
      title: word.data.title,
      content: word.body,
    };
  });

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      "Content-type": "application/json",
    },
  });
}
