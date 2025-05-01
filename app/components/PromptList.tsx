'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Prompt {
  id: number;
  content: string;
  createdAt: string;
}

export function PromptList() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrompts = async () => {
    try {
      const res = await fetch('/api/prompts');
      const data = await res.json();
      setPrompts(data.prompts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching prompts:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
    // Refresh prompts every 30 seconds
    const interval = setInterval(fetchPrompts, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="text-center py-4">Loading prompts...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {prompts.length === 0 ? (
        <p className="text-center col-span-full">No prompts available.</p>
      ) : (
        prompts.map((prompt) => (
          <Link
            href={`/instruction/${prompt.id}`}
            key={prompt.id}
            className="block hover:shadow-lg transition-shadow duration-200"
          >
            <div className="border p-4 rounded-lg bg-white hover:bg-gray-50">
              <p className="line-clamp-3">{prompt.content}</p>
              <p className="text-sm text-gray-500 mt-2">
                {new Date(prompt.createdAt).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}