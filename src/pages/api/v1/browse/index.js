import { getCollection } from "astro:content";

/**
 * Get all jargons (word) from the dictionary
 * @param {import("astro").APIContext} context
 * 
 * @todo implement pagination
 */
export async function GET() {
  const dictionary = await getCollection("dictionary");
  const response = dictionary.map(word => {
    return {
      slug: word.slug,
      title: word.data.title,
      content: word.body
    }
  });

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      "Content-type": "application/json"
    }
  });
}