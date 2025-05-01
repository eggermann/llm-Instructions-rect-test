import { logger } from './logger';

const MAX_CONTENT_LENGTH = 5000; // Limit content length to stay within token limits
const RELEVANT_TAGS = ['title', 'meta', 'h1', 'h2', 'h3', 'p']; // Only extract content from these tags

function extractRelevantContent(html: string): string {
  try {
    // Basic HTML parsing using regex
    let relevantContent = '';
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    if (titleMatch) {
      relevantContent += `Title: ${titleMatch[1]}\n`;
    }

    // Extract meta description
    const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
    if (descMatch) {
      relevantContent += `Description: ${descMatch[1]}\n`;
    }

    // Extract headings and paragraphs (first occurrence of each)
    RELEVANT_TAGS.forEach(tag => {
      const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 'i');
      const match = html.match(regex);
      if (match) {
        relevantContent += `${tag.toUpperCase()}: ${match[1]}\n`;
      }
    });

    // Clean up HTML entities and extra whitespace
    relevantContent = relevantContent
      .replace(/&[^;]+;/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Truncate if too long
    if (relevantContent.length > MAX_CONTENT_LENGTH) {
      relevantContent = relevantContent.substring(0, MAX_CONTENT_LENGTH) + '...';
    }

    logger.debug('Extracted relevant content', { 
      contentLength: relevantContent.length 
    });

    return relevantContent;
  } catch (error) {
    logger.error('Error extracting relevant content', { error });
    return '';
  }
}

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
    const html = await response.text();
    const relevantContent = extractRelevantContent(html);
    
    logger.debug('Successfully scraped and filtered URL content', { 
      url, 
      originalLength: html.length,
      filteredLength: relevantContent.length
    });
    
    return relevantContent;
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

  // Final length check
  if (combinedContent.length > MAX_CONTENT_LENGTH) {
    combinedContent = combinedContent.substring(0, MAX_CONTENT_LENGTH) + '...';
    logger.debug('Combined content truncated to stay within limits', {
      finalLength: combinedContent.length
    });
  }

  return combinedContent;
}