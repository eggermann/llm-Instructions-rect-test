import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'prompts.json');

function getPrompts() {
  if (!fs.existsSync(DB_PATH)) {
    return { prompts: [] };
  }
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

function savePrompts(prompts: any) {
  const dirPath = path.dirname(DB_PATH);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(prompts, null, 2));
}

export async function GET() {
  try {
    const data = getPrompts();
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