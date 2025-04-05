import { generateText, streamText } from "ai";
import { google } from "@ai-sdk/google";
import { readFileSync } from "fs";
import { join } from "path";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Load system prompt from system.txt
const content = readFileSync(
  join(process.cwd(), "src/app/system.txt"),
  "utf-8"
);

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const result = await generateText({
      model: google("gemini-2.0-flash"),
      messages: [
        { role: "system", content },
        { role: "user", content: prompt },
      ],
    });

    return Response.json(result);
  } catch (err) {
    console.error("error: ", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}

export async function GET(req: Request) {
  return new Response("Hello, world!");
}
