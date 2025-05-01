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

// OpenAI client initialization
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Constants
const SYSTEM_PROMPT = `You are a creative web component generator specializing in eye-catching commercial banners.
Create modern, animated, and interactive components using HTML, CSS, and JavaScript.

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
- Dynamic content updates`;

// Functions
export async function analyzeUrlsInPrompt(prompt: string): Promise<string[]> {
  logger.info('Analyzing prompt for URLs', { prompt });
  
  try {
    const analysis = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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
  logger.info('Generating component', { prompt, hasAdditionalContext: !!additionalContext });

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT + (additionalContext ? `\n\nUse this scraped content as reference:\n${additionalContext}` : '')
      },
      {
        role: "user",
        content: `Generate an eye-catching commercial banner component based on this prompt: ${prompt}. 
        Make it visually appealing with animations and interactive elements.`
      }
    ],
    temperature: 0.8,
    max_tokens: 3000,
    response_format: { type: "json_object" }
  });

  const generatedContent = completion.choices[0]?.message?.content;
  if (!generatedContent) {
    throw new Error('No content generated');
  }

  logger.debug('Generated content from OpenAI', { generatedContent });

  try {
    const parsedContent = JSON.parse(generatedContent) as GeneratedComponent;
    
    if (!parsedContent.html || !parsedContent.css || !parsedContent.javascript) {
      throw new Error('Invalid response format');
    }

    return parsedContent;
  } catch (error) {
    logger.error('Error parsing OpenAI response', { error });
    throw new Error('Invalid response format');
  }
}