import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Prompt {
  id: number;
  content: string;
  createdAt: string;
}

interface PromptsData {
  prompts: Prompt[];
}

const DB_PATH = path.join(process.cwd(), 'data', 'prompts.json');

function getPrompts(): PromptsData {
  if (!fs.existsSync(DB_PATH)) {
    return { prompts: [] };
  }
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

function savePrompts(prompts: PromptsData) {
  const dirPath = path.dirname(DB_PATH);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(prompts, null, 2));
}

export async function GET() {
  try {
    const data = getPrompts();
    // Sort prompts by createdAt in descending order (newest first)
    data.prompts.sort((a: Prompt, b: Prompt) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const data = getPrompts();
    const newPrompt = {
      id: Date.now(),
      content,
      createdAt: new Date().toISOString(),
    };

    data.prompts.push(newPrompt);
    savePrompts(data);

    return NextResponse.json(newPrompt, { status: 201 });
  } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to create prompt' },
      { status: 500 }
    );
  }
}