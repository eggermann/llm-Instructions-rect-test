import { logger } from "../logger";
import { openai } from "./config";
import { generateComponent } from "./componentGenerator";
import { WidgetWithImage } from "./types";

/**
 * Generate a responsive widget with a thematic background image.
 */
export async function generateWidgetWithImage(
  prompt: string,
  additionalContext: string = ""
): Promise<WidgetWithImage> {
  // First generate the base component
  const { content } = await generateComponent(prompt, additionalContext);

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

  const colorScheme = content.theme;

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