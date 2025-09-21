import { LangChainAdapter } from "ai";
import { RunnableSequence } from "@langchain/core/runnables";
import { jAIPrompt, model } from "../../../../apps/jai/index.js";
import { HttpResponseOutputParser } from "langchain/output_parsers";

export async function POST({ request }) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "same-origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  try {
    // Extract the `messages` from the body of the request
    const { messages } = await request.json();

    const currentMessageContent = messages[messages.length - 1].content;

    // Create the parser - parses the response from the model into http-friendly format
    const parser = new HttpResponseOutputParser();

    // Create a chain of runnables - this is the core of the LangChain API
    const chain = RunnableSequence.from([
      {
        question: (input) => input.question,
      },
      jAIPrompt.ASK,
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
