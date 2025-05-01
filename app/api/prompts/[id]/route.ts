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

function savePrompts(data: any) {
  const dirPath = path.dirname(DB_PATH);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = getPrompts();
    const promptIndex = data.prompts.findIndex(
      (p: any) => p.id === parseInt(params.id, 10)
    );

    if (promptIndex === -1) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    data.prompts.splice(promptIndex, 1);
    savePrompts(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json(
      { error: 'Failed to delete prompt' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { content } = await request.json();
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const data = getPrompts();
    const promptIndex = data.prompts.findIndex(
      (p: any) => p.id === parseInt(params.id, 10)
    );

    if (promptIndex === -1) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    data.prompts[promptIndex] = {
      ...data.prompts[promptIndex],
      content,
      updatedAt: new Date().toISOString(),
    };

    savePrompts(data);

    return NextResponse.json(data.prompts[promptIndex]);
  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to update prompt' },
      { status: 500 }
    );
  }
}