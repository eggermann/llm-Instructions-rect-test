import { logger } from "../logger";
import { GeneratedComponent } from "./types";

export function cleanAndParseJSON(raw: string): GeneratedComponent {
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
      logger.error("Could not extract JSON block", { raw: cleaned });
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

  try {
    // First attempt: Direct parse after minimal cleanup
    cleaned = cleaned
      .trim()
      .replace(/^\uFEFF/, '')        // Remove BOM
      .replace(/\r\n|\r/g, '\n')     // Normalize line endings
      .replace(/\n\s*\n/g, '\n');    // Remove empty lines

    try {
      const parsed = JSON.parse(cleaned) as GeneratedComponent;
      logger.debug("Successfully parsed JSON on first attempt");
      return validateComponent(parsed, cleaned);
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

      const parsed = JSON.parse(fixedJson) as GeneratedComponent;
      logger.debug("Successfully parsed JSON after cleanup");
      return validateComponent(parsed, fixedJson);
    }
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

    logger.error("JSON parsing failed", {
      error: errorMessage,
      details: {
        length: cleaned.length,
        sample: cleaned.substring(0, 200),
        errorType: error.name
      }
    });

    throw new Error(errorMessage);
  }
}

function validateComponent(parsed: GeneratedComponent, cleaned: string): GeneratedComponent {
  const validationErrors = [];
  if (!parsed.html) validationErrors.push('Missing HTML content');
  if (!parsed.css) validationErrors.push('Missing CSS content');
  if (!parsed.javascript && parsed.javascript !== '') validationErrors.push('Missing JavaScript content');
  if (!parsed.imageDescription) validationErrors.push('Missing image description');

  if (validationErrors.length > 0) {
    const error = `Invalid component structure: ${validationErrors.join(', ')}`;
    logger.error("Validation failed", {
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

  return parsed;
}