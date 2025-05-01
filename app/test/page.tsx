'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';

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
  const searchParams = useSearchParams();
  const promptId = searchParams.get('prompt');

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string>(promptId || '');
  const [widgetData, setWidgetData] = useState<WidgetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const response = await fetch('/api/prompts');
      const data = await response.json();
      setPrompts(data.prompts);
      
      // If no prompt is selected and we have prompts, select the first one
      if (!selectedPromptId && data.prompts.length > 0) {
        setSelectedPromptId(String(data.prompts[0].id));
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
      setError('Failed to load prompts');
    }
  };

  const generateWidget = async () => {
    if (!selectedPromptId) return;

    setLoading(true);
    setError(null);
    try {
      const selectedPrompt = prompts.find(p => String(p.id) === selectedPromptId);
      if (!selectedPrompt) throw new Error('Prompt not found');

      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: selectedPrompt.content }),
      });
      
      if (!response.ok) throw new Error('Failed to generate widget');
      
      const data = await response.json();
      setWidgetData(data);
    } catch (error) {
      console.error('Error generating widget:', error);
      setError('Failed to generate widget. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPromptId(e.target.value);
    setWidgetData(null); // Clear previous widget when prompt changes
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Widget Generator</h1>
        <Link
          href="/"
          className="text-blue-500 hover:text-blue-600 flex items-center"
        >
          ← Back to Prompts
        </Link>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
          Select a Prompt
        </label>
        <div className="flex gap-4">
          <select
            id="prompt"
            value={selectedPromptId}
            onChange={handlePromptChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select a prompt...</option>
            {prompts.map((prompt) => (
              <option key={prompt.id} value={prompt.id}>
                {prompt.content.substring(0, 100)}...
              </option>
            ))}
          </select>
          <button
            onClick={generateWidget}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap"
            disabled={loading || !selectedPromptId}
          >
            {loading ? 'Generating...' : 'Generate Widget'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}
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