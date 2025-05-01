'use client';

import { useState, useEffect } from 'react';

interface Prompt {
  id: number;
  title: string;
  content: string;
}

export function PromptList() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/prompts')
      .then((res) => res.json())
      .then((data: Prompt[]) => {
        setPrompts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching prompts:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading prompts...</div>;
  }

  return (
    <div className="space-y-4">
      {prompts.length === 0 ? (
        <p>No prompts available.</p>
      ) : (
        prompts.map((prompt) => (
          <div key={prompt.id} className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold">{prompt.title}</h2>
            <p className="mt-2">{prompt.content}</p>
          </div>
        ))
      )}
    </div>
  );
}