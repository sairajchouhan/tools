import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { readFileSync } from "fs";
import { join } from "path";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Load system prompt from system.txt
const content = readFileSync(join(process.cwd(), "src/app/system.txt"), "utf-8");


export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google("gemini-2.0-flash"),
    messages: [{ role: "system", content  }, ...messages],
  });

  return result.toDataStreamResponse();
}

export async function GET(req: Request) {
  return new Response("Hello, world!");
}
