import { RunnableSequence } from "@langchain/core/runnables";
import {
  getMessageText,
  jAIPrompts,
  model,
} from "../../../../apps/jai/index.js";
import { HttpResponseOutputParser } from "langchain/output_parsers";

const allowedOrigins = [
  "https://www.jargons.dev", // production
  "http://localhost:4321", // local dev (default Astro port)
  // add other allowed preview URLs if needed
];

function getCorsHeaders(origin) {
  const headers = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };

  // Allow known origins and Vercel preview deployments
  if (
    allowedOrigins.includes(origin) ||
    (origin && origin.endsWith("-jargonsdev.vercel.app"))
  ) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

export async function OPTIONS({ request }) {
  const origin = request.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST({ request }) {
  const origin = request.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  try {
    // Extract the `messages` from the body of the request
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: "Invalid request body" },
        { status: 400, headers: corsHeaders },
      );
    }

    const currentMessageContent = getMessageText(messages[messages.length - 1]);

    // Create the parser - parses the response from the model into http-friendly format
    const parser = new HttpResponseOutputParser();

    // Create a chain of runnables - this is the core of the LangChain API
    const chain = RunnableSequence.from([
      {
        question: (input) => input.question,
      },
      jAIPrompts.SEARCH_WORD,
      model,
      parser,
    ]);

    // Convert the response into a friendly text-stream
    const stream = await chain.stream({
      question: currentMessageContent,
    });

    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(chunk);
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(responseStream, {
      headers: {
        ...corsHeaders,
        "Cache-Control": "no-cache",
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (e) {
    return Response.json(
      { error: e.message },
      {
        status: e.status ?? 500,
        headers: corsHeaders,
      },
    );
  }
}
