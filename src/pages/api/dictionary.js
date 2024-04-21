/**
 * Submit New Word to Dictionary
 * @param {import("astro").APIContext} context
 */
export async function POST({ request }) {
  const data = await request.formData();
  
  const title = data.get("title");
  const content = data.get("content");
  const action = data.get("action");
  const metadata = JSON.parse(data.get("metadata"));

  console.log({
    title, content, action, metadata
  });

  return new Response(JSON.stringify(""), {
    status: 200,
    headers: {
      "Content-type": "application/json"
    }
  });
}