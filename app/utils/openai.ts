import OpenAI from 'openai';
import { logger } from './logger';
import { scrapeMultipleUrls } from './urlScraper';

// Types
export interface GeneratedComponent {
  html: string;
  css: string;
  javascript: string;
}

interface UrlAnalysisResult {
  urls: string[];
}

// OpenAI Configuration
const OPENAI_CONFIG = {
  model: 'gpt-4-turbo-preview',
  maxTokens: 4000,
  temperature: 0.8,
  systemPrompt: `You are a creative web component generator specializing in eye-catching commercial banners.
Create modern, animated, and interactive components using HTML, CSS, and JavaScript.

Your response must be in valid JSON format with the following structure:
{
  "html": "<!-- Your HTML code here -->",
  "css": "/* Your CSS code here */",
  "javascript": "// Your JavaScript code here"
}

Requirements:
- Use modern CSS features (flexbox, grid, animations)
- Add smooth animations and transitions
- Include interactive elements (hover effects, clicks)
- Ensure responsive design
- Use semantic HTML
- Keep JavaScript vanilla (no frameworks)

Example features to include:
- Parallax effects
- Floating elements
- Gradient animations
- Mouse-follow effects
- Smooth reveal animations
- Interactive CTAs
- Dynamic content updates

Remember to return a valid JSON response containing html, css, and javascript properties.`
} as const;

logger.info('Initializing OpenAI with configuration', OPENAI_CONFIG);

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function estimateTokens(text: string): number {
  // Rough estimation: ~4 characters per token
  return Math.ceil(text.length / 4);
}

export async function analyzeUrlsInPrompt(prompt: string): Promise<string[]> {
  logger.info('Analyzing prompt for URLs', { prompt });
  
  try {
    const analysis = await openai.chat.completions.create({
      model: OPENAI_CONFIG.model,
      temperature: OPENAI_CONFIG.temperature,
      messages: [
        {
          role: "system",
          content: "You are a URL analyzer. Check if the prompt contains URLs that should be scraped for content generation."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      functions: [
        {
          name: "scrape_urls",
          description: "Scrape content from the provided URLs",
          parameters: {
            type: "object",
            properties: {
              urls: {
                type: "array",
                items: {
                  type: "string"
                },
                description: "Array of URLs to scrape"
              }
            },
            required: ["urls"]
          }
        }
      ],
      function_call: "auto"
    });

    const functionCall = analysis.choices[0]?.message?.function_call;
    if (functionCall?.name === "scrape_urls") {
      const result = JSON.parse(functionCall.arguments) as UrlAnalysisResult;
      logger.debug('URLs found in prompt', { urls: result.urls });
      return result.urls;
    }

    return [];
  } catch (error) {
    logger.error('Error analyzing URLs', { error });
    return [];
  }
}

export async function generateComponent(prompt: string, additionalContext: string = ''): Promise<GeneratedComponent> {
  logger.info('Generating component', { 
    model: OPENAI_CONFIG.model,
    promptLength: prompt.length,
    contextLength: additionalContext.length
  });

  try {
    // Check estimated token count
    const estimatedTokens = estimateTokens(prompt + additionalContext + OPENAI_CONFIG.systemPrompt);
    if (estimatedTokens > 14000) { // Leave some margin for safety
      logger.warn('Content might exceed token limit, truncating context', {
        estimatedTokens,
        promptLength: prompt.length,
        contextLength: additionalContext.length
      });
      // Truncate additional context while preserving prompt
      const maxContextLength = Math.max(1000, 14000 * 4 - prompt.length - OPENAI_CONFIG.systemPrompt.length);
      additionalContext = additionalContext.substring(0, maxContextLength);
    }

    const completion = await openai.chat.completions.create({
      model: OPENAI_CONFIG.model,
      messages: [
        {
          role: "system",
          content: OPENAI_CONFIG.systemPrompt + (additionalContext ? `\n\nUse this scraped content as reference:\n${additionalContext}` : '')
        },
        {
          role: "user",
          content: `Generate an eye-catching commercial banner component based on this prompt: ${prompt}. 
          Make it visually appealing with animations and interactive elements.
          Return the response as a JSON object with 'html', 'css', and 'javascript' properties.`
        }
      ],
      temperature: OPENAI_CONFIG.temperature,
      max_tokens: OPENAI_CONFIG.maxTokens,
      response_format: { type: "json_object" }
    });

    const generatedContent = completion.choices[0]?.message?.content;
    if (!generatedContent) {
      throw new Error('No content generated');
    }

    logger.debug('Generated content from OpenAI', { generatedContent });

    try {
      const parsedContent = JSON.parse(generatedContent) as GeneratedComponent;
      
      if (!parsedContent.html || !parsedContent.css || parsedContent.javascript === undefined) {
        logger.error('Invalid component structure', { parsedContent });
        throw new Error('Invalid response format: Missing required fields');
      }

      // Ensure fields are strings
      if (typeof parsedContent.html !== 'string' || 
          typeof parsedContent.css !== 'string' || 
          typeof parsedContent.javascript !== 'string') {
        logger.error('Invalid field types', { parsedContent });
        throw new Error('Invalid response format: Fields must be strings');
      }

      logger.info('Successfully validated component structure');
      return parsedContent;
    } catch (parseError) {
      logger.error('Failed to parse or validate component', { parseError });
      throw parseError;
    }
  } catch (error) {
    logger.error('Error in component generation', { 
      error: error instanceof Error ? error.message : String(error),
      type: error instanceof Error ? error.constructor.name : 'Unknown'
    });

    if (error instanceof OpenAI.APIError) {
      if (error.status === 400) {
        if (error.message.includes('maximum context length')) {
          throw new Error('Content too long. Please try with a shorter prompt or fewer URLs.');
        }
        if (error.message.includes('response_format')) {
          logger.error('OpenAI response format error', { error });
          throw new Error('Internal error: Invalid response format configuration');
        }
      }
      throw new Error(`OpenAI API error: ${error.message}`);
    }

    if (error instanceof SyntaxError) {
      logger.error('JSON parsing error', { error });
      throw new Error('Failed to parse component data');
    }

    throw new Error('Failed to generate component');
  }
}