import { logger } from './logger';

export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlRegex) || [];
  logger.debug('Extracted URLs', { urls });
  return urls;
}

export async function scrapeUrl(url: string): Promise<string | null> {
  logger.info('Attempting to scrape URL', { url });
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    logger.debug('Successfully scraped URL', { 
      url, 
      contentLength: text.length 
    });
    return text;
  } catch (error) {
    logger.error('Error scraping URL', { 
      url, 
      error: error instanceof Error ? error.message : String(error) 
    });
    return null;
  }
}

export async function scrapeMultipleUrls(urls: string[]): Promise<string> {
  logger.info('Starting multiple URL scrape', { urlCount: urls.length });
  let combinedContent = '';

  for (const url of urls) {
    const content = await scrapeUrl(url);
    if (content) {
      combinedContent += `\nContent from ${url}:\n${content}\n`;
    }
  }

  logger.debug('Completed multiple URL scrape', { 
    urlCount: urls.length,
    combinedContentLength: combinedContent.length 
  });
  
  return combinedContent;
}