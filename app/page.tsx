'use client';
import { useState } from 'react';
import { PromptList } from './components/PromptList';

export default function HomePage() {
  const [promptInput, setPromptInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: promptInput }),
      });

      if (response.ok) {
        setPromptInput('');
      }
    } catch (error) {
      console.error('Error adding prompt:', error);
    }
  };

  return (
    <>
      <h1 className="text-4xl font-bold mb-8">Welcome to PromptPing.de</h1>
      
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Enter your prompt..."
              className="flex-1 p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-sm"
            >
              Add Prompt
            </button>
          </div>
        </form>

        <PromptList />
      </div>
    </>
  );
}