'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Prompt {
  id: number;
  content: string;
  createdAt: string;
}

export default function InstructionPage({ params }: { params: { id: string } }) {
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/prompts/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setPrompt(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching prompt:', error);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!prompt) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">Prompt not found</div>
        <Link href="/" className="text-blue-500 hover:underline mt-4 inline-block">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">
        ← Back to Home
      </Link>
      <div className="bg-white rounded-lg shadow-lg p-6 mt-4">
        <p className="text-gray-700 whitespace-pre-wrap">{prompt.content}</p>
        <div className="mt-4 text-sm text-gray-500">
          Created on {new Date(prompt.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}