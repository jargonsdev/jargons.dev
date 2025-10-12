import { LangChainAdapter } from "ai";
import { RunnableSequence } from "@langchain/core/runnables";
import { jAIPrompts, model } from "../../../../apps/jai/index.js";
import { HttpResponseOutputParser } from "langchain/output_parsers";

const allowedOrigins = [
  "https://www.jargons.dev", // production
  "http://localhost:4321", // local dev (default Next.js port)
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

    const currentMessageContent = messages[messages.length - 1].content;

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

    // Convert Uint8Array stream to string stream before returning
    const textStream = new ReadableStream({
      async start(controller) {
        const decoder = new TextDecoder();
        for await (const chunk of stream) {
          controller.enqueue(decoder.decode(chunk));
        }
        controller.close();
      },
    });

    const response = LangChainAdapter.toDataStreamResponse(textStream);

    // Add CORS headers to the response
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
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
