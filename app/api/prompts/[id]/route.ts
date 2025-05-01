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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = getPrompts();
    const prompt = data.prompts.find(
      (p: any) => p.id === parseInt(params.id, 10)
    );

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(prompt);
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompt' },
      { status: 500 }
    );
  }
}