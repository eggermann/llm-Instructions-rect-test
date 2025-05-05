import { NextResponse } from 'next/server';
import { logger } from '@/app/utils/logger';
import { generateWidgetWithImage } from '@/app/utils/openai';
import { extractUrls, scrapeMultipleUrls } from '@/app/utils/urlScraper';
import { extractUrlsFromText } from '@/app/utils/openai/urlProcessor';
/**
 * OpenAI API route handler for generating widgets
 */
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

    logger.info('Processing widget generation request', { prompt });

    // Extract and scrape URLs if present
    // const urls = extractUrls(prompt);
    const urls = await extractUrlsFromText(prompt);

    logger.info('Extracted URLs from prompt', { urls });

    let additionalContext = '';

    if (urls.length > 0) {
      logger.info('Found URLs in prompt', { urls });
      try {
        const scrapedContent = await scrapeMultipleUrls(urls);
        if (scrapedContent) {
          additionalContext = `Additional context from URLs:\n${scrapedContent}`;
          logger.info('Successfully scraped URL content', {
            contentLength: scrapedContent.length
          });
        }
      } catch (error) {
        logger.warn('Error scraping URLs', { error });
        // Continue with widget generation even if URL scraping fails
      }
    }

    // Generate widget with background image and scraped context
    const widget = await generateWidgetWithImage(prompt, additionalContext);

    logger.info('Successfully generated widget with image', {
      promptLength: prompt.length,
      htmlLength: widget.html.length,
      cssLength: widget.css.length,
      jsLength: widget.javascript.length,
      imageDescription: widget.imageDescription
    });

    return NextResponse.json(widget);
  } catch (error) {
    logger.error('Error in widget generation', {
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json(
      { error: 'Failed to generate widget content' },
      { status: 500 }
    );
  }
}