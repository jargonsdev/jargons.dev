import { RunnableSequence } from "@langchain/core/runnables";
import { HttpResponseOutputParser } from "@langchain/classic/output_parsers";
import { formatDocumentsAsString } from "@langchain/classic/util/document";
import {
  jAIPrompts,
  model,
  formatMessage,
  getMessageText,
  vectorStore,
} from "@/apps/jai/index.js";

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

export async function POST({ request }) {
  const corsHeaders = getCorsHeaders(request.headers.get("origin"));

  try {
    // Extract the `messages` from the body of the request
    const { messages } = await request.json();
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    const currentMessageContent = getMessageText(messages[messages.length - 1]);

    // Get similar documents from the vector store
    const similarDocs = await vectorStore.similaritySearch(
      currentMessageContent,
    );

    // Create the parser - parses the response from the model into http-friendly format
    const parser = new HttpResponseOutputParser();

    // Create a chain of runnables - this is the core of the LangChain API
    const chain = RunnableSequence.from([
      {
        question: (input) => input.question,
        chat_history: (input) => input.chat_history,
        context: () => formatDocumentsAsString(similarDocs),
      },
      jAIPrompts.FOLLOW_UP_CHAT,
      model,
      parser,
    ]);

    // Convert the response into a friendly text-stream
    const stream = await chain.stream({
      chat_history: formattedPreviousMessages.join("\n"),
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
