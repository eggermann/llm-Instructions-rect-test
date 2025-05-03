import type { ChatCompletionMessageParam } from "openai/resources";
import { logger } from "../logger";
import { openai, DEFAULT_MODEL, DEFAULT_TEMPERATURE, DEFAULT_MAX_TOKENS, SYSTEM_MESSAGE } from "./config";
import { cleanAndParseJSON } from "./jsonCleaner";
import { OpenAIResponse } from "./types";

/**
 * Generate a responsive widget component based on the supplied prompt and optional context.
 */
export async function generateComponent(
  prompt: string,
  additionalContext: string = ""
): Promise<OpenAIResponse> {
  logger.info("generateComponent: Sending prompt to OpenAI", { prompt, additionalContext });

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: SYSTEM_MESSAGE + (additionalContext ? `\nContext:\n${additionalContext}` : ""),
    },
    { role: "user", content: prompt },
  ];

  const completion = await openai.chat.completions.create({
    model: DEFAULT_MODEL,
    messages,
    temperature: DEFAULT_TEMPERATURE,
    max_tokens: DEFAULT_MAX_TOKENS
  });

  const raw = completion.choices[0]?.message?.content;

  console.log("OpenAI response:", { raw });
  if (!raw) {
    logger.error("generateComponent: No response from OpenAI", { completion });
    throw new Error("generateComponent: No response from OpenAI");
  }

  // Log the raw response for debugging
  logger.debug("Raw OpenAI response", { raw });

  const parsed = cleanAndParseJSON(raw);

  return {
    content: parsed,
    raw: raw
  };
}