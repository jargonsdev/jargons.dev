import { getCollection } from "astro:content";

/**
 * Get a text file of all jargons (word) from the dictionary
 * @param {import("astro").APIContext} context
 */
export async function GET() {
  const dictionary = await getCollection("dictionary");
  const words = dictionary.map((word) => {
    return word.data.title.toLowerCase();
  });
  const response = "" + words.join("\n");

  return new Response(response, {
    status: 200,
    headers: {
      "Content-type": "application/txt",
    },
  });
}
