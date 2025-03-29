import { streamText } from "ai";
import { google } from "@ai-sdk/google";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google("gemini-1.5-pro"),
    messages,
  });

  return result.toDataStreamResponse();
}

export async function GET(req: Request) {
  return new Response("Hello, world!");
}
