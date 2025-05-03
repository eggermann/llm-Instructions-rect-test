import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources";
import { logger } from "./logger";

// Types
export interface GeneratedComponent {
  html: string;
  css: string;
  javascript: string;
  imageDescription: string;
  theme: {
    primary: string;
    secondary: string;
    gradient: string;
  };
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
  logger.info("generateComponent: Sending prompt to OpenAI", { prompt ,additionalContext});

  const systemMessage = `You are a widget designer. Create a responsive widget based on the user prompt.
  Format response as a JSON object with these properties. IMPORTANT: Use double quotes for strings and escape special characters properly:
  - html: The widget's HTML structure (use relative units for responsiveness, use double quotes for strings)
  - css: The widget's CSS styles (use double quotes for strings) with strong emphasis on contrast and readability:
    * Use high contrast color combinations
    * Add text shadows or outlines where needed
    * Ensure text is easily readable on any background
    * Consider using semi-transparent backgrounds for text containers
    * Include media queries for responsive design
  - javascript: Any required JavaScript code (use double quotes for strings)
  - imageDescription: Create a vivid, artistic image description that captures the essence
  and emotion of the content. Focus on mood, style, and visual metaphors that represent
  the core message. Be specific about artistic style (e.g. "digital art", "watercolor",
  "neon", "abstract geometric"). The image will serve as an impactful background.
  - theme: Define a color scheme that matches the content theme:
    * primary: Main theme color (hex format, e.g. "#4CAF50")
    * secondary: Secondary theme color for accents (hex format)
    * gradient: CSS gradient string for overlays (e.g. "linear-gradient(rgba(76,175,80,0.3), rgba(46,125,50,0.4))")
  
  IMPORTANT: Do not use backticks (\`) for any code blocks. Use escaped double quotes and newlines instead.
  Example format:
  {
    "html": "<div class=\"container\">\n  <h1>Title</h1>\n</div>",
    "css": ".container {\n  color: #000;\n}",
    "javascript": "function init() {\n  console.log(\"Hello\");\n}",
    "imageDescription": "A vibrant digital art composition..."
  }

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

  // Log the raw response for debugging
  logger.debug("Raw OpenAI response", { raw });

  // Clean and extract valid JSON if extra characters exist
  let cleaned = raw.trim();
  
  // Log initial cleaning
  logger.debug("Initial cleaning", { cleaned });

  // If response contains markdown code blocks, extract the JSON from within them
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*({[\s\S]*?})\s*```/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1];
    logger.debug("Extracted from code block", { cleaned });
  } else {
    // If no code blocks, find the first { and last }
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) {
      logger.error("generateComponent: Could not extract JSON block", { raw: cleaned });
      throw new Error("Failed to extract JSON block from OpenAI response");
    }
    cleaned = cleaned.substring(start, end + 1);
    logger.debug("Extracted JSON object", { cleaned });
  }

  // Clean up the JSON string step by step
  // Pre-processing steps before JSON extraction
  const preCleaningSteps = [
    { desc: "Remove BOM and hidden chars", regex: /^\uFEFF/, replace: '' },
    { desc: "Remove extra newlines", regex: /\n\s*\n/g, replace: '\n' },
    { desc: "Normalize line endings", regex: /\r\n?/g, replace: '\n' }
  ];

  // Apply pre-cleaning
  for (const step of preCleaningSteps) {
    const before = cleaned;
    cleaned = cleaned.replace(step.regex, step.replace);
    if (before !== cleaned) {
      logger.debug(`Applied ${step.desc}`);
    }
  }

  let parsed: GeneratedComponent;

  // Enhanced JSON cleanup
  try {
    // First attempt: Direct parse after minimal cleanup
    cleaned = cleaned
      .trim()
      .replace(/^\uFEFF/, '')        // Remove BOM
      .replace(/\r\n|\r/g, '\n')     // Normalize line endings
      .replace(/\n\s*\n/g, '\n');    // Remove empty lines

    try {
      parsed = JSON.parse(cleaned) as GeneratedComponent;
      logger.debug("Successfully parsed JSON on first attempt");
    } catch (error: any) {
      // Second attempt: Handle common JSON issues
      logger.debug("Initial parse failed, attempting cleanup", {
        error: error?.message
      });

      const fixedJson = cleaned
        // Remove any text before the first {
        .replace(/^[^{]*({[\s\S]*}).*$/, '$1')
        // Fix property names
        .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
        // Remove trailing commas
        .replace(/,(\s*[}\]])/g, '$1')
        // Ensure string values are properly quoted
        .replace(/:\s*([^",{\[\]\s][^,}\]]*?)(\s*[,}])/g, ':"$1"$2')
        // Normalize whitespace
        .replace(/\s+/g, ' ');

      try {
        parsed = JSON.parse(fixedJson) as GeneratedComponent;
        logger.debug("Successfully parsed JSON after cleanup");
      } catch (error2: any) {
        logger.error("JSON parse failed after cleanup", {
          error: error2?.message,
          originalError: error?.message,
          sample: fixedJson.substring(0, 100)
        });
        throw new Error("Could not parse response into valid JSON");
      }
    }

    // Validate and log component details
    const validationErrors = [];
    if (!parsed.html) validationErrors.push('Missing HTML content');
    if (!parsed.css) validationErrors.push('Missing CSS content');
    if (!parsed.javascript && parsed.javascript !== '') validationErrors.push('Missing JavaScript content');
    if (!parsed.imageDescription) validationErrors.push('Missing image description');

    if (validationErrors.length > 0) {
      const error = `Invalid component structure: ${validationErrors.join(', ')}`;
      logger.error("generateComponent: Validation failed", {
        error,
        content: JSON.stringify({
          hasHtml: Boolean(parsed.html),
          hasCss: Boolean(parsed.css),
          hasJs: Boolean(parsed.javascript),
          hasImageDesc: Boolean(parsed.imageDescription)
        })
      });
      throw new Error(error);
    }

    logger.info('Successfully generated component', {
      contentLengths: {
        html: parsed.html.length,
        css: parsed.css.length,
        js: parsed.javascript.length,
        imageDesc: parsed.imageDescription.length
      }
    });

  } catch (error: any) {
    let errorMessage = "Failed to generate component: ";
    
    if (error.message.includes("JSON")) {
      errorMessage += "Invalid JSON format - ";
      if (cleaned.includes('```')) {
        errorMessage += "Contains markdown code blocks";
      } else if (cleaned.includes('`')) {
        errorMessage += "Contains unescaped backticks";
      } else {
        errorMessage += error.message;
      }
    } else {
      errorMessage += error.message;
    }

    logger.error("generateComponent failed", {
      error: errorMessage,
      details: {
        length: cleaned.length,
        sample: cleaned.substring(0, 200),
        errorType: error.name
      }
    });

    throw new Error(errorMessage);
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



  const colorScheme = content.theme ;

  // Add background image with theme-based CSS
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
  /* Customize overlay colors based on the prompt's theme */
  background: ${colorScheme.gradient};
  pointer-events: none;
}

/* Ensure content sits above overlay */
.widget-content {
  position: relative;
  z-index: 1;
  width: 100%;
  color: ${colorScheme.primary};
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  font-weight: 500;
}

/* Text container for better contrast */
.widget-content > * {
  background-color: rgba(255, 255, 255, 0.85);
  border-left: 3px solid ${colorScheme.secondary};
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 0.5rem 0;
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
    imageDescription: content.imageDescription,
    theme: content.theme
  };
}