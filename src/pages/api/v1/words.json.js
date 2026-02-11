import { getCollection } from "astro:content";

/**
 * Get a json file of all jargons (word) from the dictionary
 * @param {import("astro").APIContext} context
 */
export async function GET() {
  const dictionary = await getCollection("dictionary");
  const words = dictionary.map((word) => {
    return word.data.title.toLowerCase();
  });
  const response = {
    total: words.length,
    words,
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      "Content-type": "application/json",
    },
  });
}
