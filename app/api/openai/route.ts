import { NextResponse } from 'next/server';
import { logger } from '@/app/utils/logger';
import { analyzeUrlsInPrompt, generateComponent } from '@/app/utils/openai';
import { scrapeMultipleUrls } from '@/app/utils/urlScraper';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      logger.error('Missing prompt in request');
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    logger.info('Processing new component generation request', { prompt });

    // Check for URLs in the prompt
    const urls = await analyzeUrlsInPrompt(prompt);
    let additionalContext = '';

    if (urls.length > 0) {
      logger.info('Found URLs in prompt, scraping content', { urls });
      additionalContext = await scrapeMultipleUrls(urls);
    }

    // Generate the component
    const component = await generateComponent(prompt, additionalContext);
    
    logger.info('Successfully generated component', {
      promptLength: prompt.length,
      htmlLength: component.html.length,
      cssLength: component.css.length,
      jsLength: component.javascript.length
    });

    return NextResponse.json(component);
  } catch (error) {
    logger.error('Error in component generation', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}