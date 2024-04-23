import { getEntry } from "astro:content";

/**
 * Get a jargon (word) from the dictionary
 * @param {import("astro").APIContext} context
 * 
 * @todo Nice to have: endpoint queries the GitHub to fetch word directly from jargons.dev repo using the requester's accessToken
 */
export async function GET({ params: { slug } }) {
  const word = await getEntry("dictionary", slug);

  if (!word) {
    return new Response(JSON.stringify({ message: "Not Found" }), {
      status: 404,
      headers: {
        "Content-type": "application/json"
      }
    });
  }

  const response = {
    slug: word.slug,
    title: word.data.title,
    content: word.body
  }

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      "Content-type": "application/json"
    }
  });
}