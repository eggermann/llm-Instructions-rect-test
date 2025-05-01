import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const dataFile = path.join(process.cwd(), 'data', 'prompts.json');

// Ensure the data directory exists
async function ensureDataDirectory() {
  const dir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir);
  }
}

// Initialize empty prompts file if it doesn't exist
async function initializeDataFile() {
  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, '[]');
  }
}

// GET /api/prompts
export async function GET() {
  try {
    await ensureDataDirectory();
    await initializeDataFile();
    const data = await fs.readFile(dataFile, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading prompts:', error);
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
  }
}

// POST /api/prompts
export async function POST(request: Request) {
  try {
    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    await ensureDataDirectory();
    await initializeDataFile();

    const data = await fs.readFile(dataFile, 'utf8');
    const prompts = JSON.parse(data);
    
    const newPrompt = {
      id: Date.now(),
      title,
      content,
      createdAt: new Date().toISOString(),
    };

    prompts.push(newPrompt);
    await fs.writeFile(dataFile, JSON.stringify(prompts, null, 2));

    return NextResponse.json(newPrompt, { status: 201 });
  } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to create prompt' },
      { status: 500 }
    );
  }
}