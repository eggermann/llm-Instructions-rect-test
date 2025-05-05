import { openai, DEFAULT_MODEL } from './config';

// Define the function schema for URL extraction
const urlExtractionFunction = {
    name: 'extractUrls',
    description: 'Extract all valid URLs from the given text',
    parameters: {
        type: 'object',
        properties: {
            urls: {
                type: 'array',
                items: {
                    type: 'string',
                    description: 'A valid URL',
                },
                description: 'Array of extracted URLs',
            },
        },
        required: ['urls'],
    },
};

/**
 * Extracts URLs from the provided text using OpenAI's function calling.
 * @param text - The input text potentially containing URLs.
 * @returns An array of extracted valid URLs.
 */
export async function extractUrlsFromText(text: string): Promise<string[]> {
    try {
        // Send a request to OpenAI's Chat Completions API
        const completion = await openai.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: [
                {
                    role: 'user',
                    content: `Extract all URLs from this text: "${text}"`,
                },
            ],
            tools: [
                {
                    type: 'function',
                    function: urlExtractionFunction,
                },
            ],
            tool_choice: {
                type: 'function',
                function: { name: 'extractUrls' },
            },
        });

        // Access the function call from the response
        const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
        if (!toolCall || toolCall.function.name !== 'extractUrls') {
            return [];
        }

        // Parse and validate URLs
        try {
            const { urls } = JSON.parse(toolCall.function.arguments);
            const validUrls = urls.filter((url: string) => {
                try {
                    new URL(url);
                    return true;
                } catch {
                    return false;
                }
            });

            // Log the extracted URLs and tool call as requested
            console.log('Extracted URLs:', validUrls);
            console.log('Tool call:', toolCall);

            return validUrls;
        } catch (parseError) {
            console.error('Error parsing URLs:', parseError);
            return [];
        }
    } catch (error) {
        console.error('Error extracting URLs:', error);
        return [];
    }
}