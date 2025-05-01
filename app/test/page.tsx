'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

interface Prompt {
  id: number;
  content: string;
  createdAt: string;
}

interface WidgetData {
  html: string;
  css: string;
  javascript: string;
}

// Dynamic import to prevent hydration issues with dangerouslySetInnerHTML
const Widget = dynamic(() => import('../components/Widget'), { ssr: false });

export default function TestPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const [widgetData, setWidgetData] = useState<WidgetData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const response = await fetch('/api/prompts');
      const data = await response.json();
      setPrompts(data.prompts);
      if (data.prompts.length > 0) {
        setSelectedPrompt(data.prompts[0].content);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
    }
  };

  const generateWidget = async () => {
    if (!selectedPrompt) return;

    setLoading(true);
    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: selectedPrompt }),
      });
      
      const data = await response.json();
      setWidgetData(data);
    } catch (error) {
      console.error('Error generating widget:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPrompt(e.target.value);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Widget Generator</h1>
      
      <div className="max-w-2xl">
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
          Select a Prompt
        </label>
        <div className="flex gap-4">
          <select
            id="prompt"
            value={selectedPrompt}
            onChange={handlePromptChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {prompts.map((prompt) => (
              <option key={prompt.id} value={prompt.content}>
                {prompt.content.substring(0, 100)}...
              </option>
            ))}
          </select>
          <button
            onClick={generateWidget}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={loading || !selectedPrompt}
          >
            {loading ? 'Generating...' : 'Generate Widget'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generating your widget...</p>
        </div>
      )}

      {widgetData && <Widget data={widgetData} />}
    </div>
  );
}