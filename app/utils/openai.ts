import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources";
import { logger } from "./logger";

// Types
export interface GeneratedComponent {
  html: string;
  css: string;
  javascript: string;
  imageDescription: string;
}

export interface OpenAIResponse {
  content: GeneratedComponent;
  raw: string;
}

export interface WidgetWithImage extends Omit<GeneratedComponent, 'imageDescription'> {
  description: string;
  imageUrl: string;
  imageDescription: string;
}

// OpenAI client initialization
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DEFAULT_MODEL = "gpt-4-turbo";
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 4000;

/**
 * Generate a responsive widget component based on the supplied prompt and optional context.
 */
export async function generateComponent(
  prompt: string,
  additionalContext: string = ""
): Promise<OpenAIResponse> {
  logger.info("generateComponent: Sending prompt to OpenAI", { prompt });

  const systemMessage = `You are a widget designer. Create a responsive widget based on the user prompt.
Format response as a JSON object with these properties:
- html: The widget's HTML structure (use relative units for responsiveness)
- css: The widget's CSS styles (include media queries if needed)
- javascript: Any required JavaScript code
- imageDescription: Create a vivid, artistic image description that captures the essence and emotion of the content. Focus on mood, style, and visual metaphors that represent the core message. Be specific about artistic style (e.g. 'digital art', 'watercolor', 'neon', 'abstract geometric'). The image will serve as an impactful background.

${additionalContext ? `Additional context to analyze:\n${additionalContext}` : ''}`;

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: systemMessage + (additionalContext ? `\nContext:\n${additionalContext}` : ""),
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

  // Clean and extract valid JSON if extra characters exist
  let cleaned = raw.trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) {
    logger.error("generateComponent: Could not extract JSON block", { raw: cleaned });
    throw new Error("Failed to extract JSON block from OpenAI response");
  }
  cleaned = cleaned.substring(start, end + 1);
  if (cleaned.includes("```")) {
    cleaned = cleaned.substring(0, cleaned.indexOf("```")).trim();
  }

  let parsed: GeneratedComponent;
  try {
    parsed = JSON.parse(cleaned) as GeneratedComponent;
    logger.info('Generated component with image description', {
      imageDescription: parsed.imageDescription
    });
  } catch (err) {
    // Fallback: Replace literal newline characters with escaped newlines and try again
    try {
      const fallbackCleaned = cleaned.replace(/\n/g, "\\n");
      parsed = JSON.parse(fallbackCleaned) as GeneratedComponent;
    } catch (err2) {
      logger.error("generateComponent: JSON parse error after fallback", { raw: cleaned, error: err2 });
      throw new Error("Failed to parse OpenAI response");
    }
  }

  if (
    parsed.html == null ||
    parsed.css == null ||
    parsed.javascript == null || // accept empty string
    parsed.imageDescription == null
  ) {
    logger.error("generateComponent: Response missing fields", { raw: cleaned });
    throw new Error("OpenAI response missing required fields");
  }

  return {
    content: parsed,
    raw: cleaned
  };
}

/**
 * Generate a responsive widget with a thematic background image.
 */
export async function generateWidgetWithImage(
  prompt: string,
  additionalContext: string = ""
): Promise<WidgetWithImage> {
  // First generate the base component
  const { content, raw } = await generateComponent(prompt, additionalContext);

  // Use the provided image description for DALL-E
  const imagePrompt = content.imageDescription;

  // Log the image description being used
  logger.info('Using image description for DALL-E', {
    imageDescription: imagePrompt
  });

  // Generate image via DALL·E
  const imageResponse = await openai.images.generate({
    model: "dall-e-3",
    prompt: imagePrompt,
    n: 1,
    size: "1024x1024"
  });

  // Get the image URL and use it directly (no base64 conversion needed)
  const imageUrl = imageResponse.data?.[0]?.url;
  if (!imageUrl || typeof imageUrl !== "string") {
    throw new Error("Image generation failed: No image URL returned");
  }

  // Add background image to CSS
  const cssWithBackground = `
/* Container with background image */
.widget-container {
  position: relative;
  width: 100%;
  min-height: 200px;
  padding: 2rem;
  background-image: url('${imageUrl}');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.widget-container:hover {
  transform: translateY(-2px);
}

/* Add semi-transparent overlay for better text contrast */
.widget-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.8));
  pointer-events: none;
}

/* Ensure content sits above overlay */
.widget-content {
  position: relative;
  z-index: 1;
  width: 100%;
}

/* Original widget styles */
${content.css}`;

  // Wrap HTML content
  const htmlWrapped = `
<div class="widget-container">
  <div class="widget-content">
    ${content.html}
  </div>
</div>`;

  // Generate description
  const description = `Widget with background image, generated from prompt: "${prompt}"`;

  return {
    html: htmlWrapped,
    css: cssWithBackground,
    javascript: content.javascript,
    description,
    imageUrl,
    imageDescription: content.imageDescription
  };
}