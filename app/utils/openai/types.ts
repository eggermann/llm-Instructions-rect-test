import type { ChatCompletionMessageParam } from "openai/resources";

export interface GeneratedComponent {
  html: string;
  css: string;
  javascript: string;
  imageDescription: string;
  theme: {
    primary: string;
    secondary: string;
    gradient: string;
  };
}

export interface OpenAIResponse {
  content: GeneratedComponent;
  raw: string;
}

export interface WidgetWithImage extends Omit<GeneratedComponent, 'imageDescription'> {
  description: string;
  imageUrl: string;
  imageDescription: string;
}