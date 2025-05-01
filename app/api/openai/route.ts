import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a web component generator that creates HTML, CSS, and JavaScript code based on prompts.
          Always return your response in the following JSON format:
          {
            "html": "<!-- Your HTML code here -->",
            "css": "/* Your CSS code here */",
            "javascript": "// Your JavaScript code here"
          }
          Ensure the code is complete, well-formatted, and creates an interactive component.
          Use modern best practices and ensure the component is responsive.`
        },
        {
          role: "user",
          content: `Generate a web component based on this prompt: ${prompt}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const generatedContent = completion.choices[0]?.message?.content;

    if (!generatedContent) {
      throw new Error('No content generated');
    }

    try {
      const parsedContent = JSON.parse(generatedContent);
      
      if (!parsedContent.html || !parsedContent.css || !parsedContent.javascript) {
        throw new Error('Invalid response format');
      }

      return NextResponse.json(parsedContent);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}