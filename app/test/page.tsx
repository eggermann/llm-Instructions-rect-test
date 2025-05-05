'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { WidgetData } from '@/app/components/Widget';
import { widgetStore } from '@/app/utils/widgetStore';
import WidgetList from '@/app/components/WidgetList';
import LoadingOverlay from '@/app/components/LoadingOverlay';

// Dynamic import to prevent hydration issues with dangerouslySetInnerHTML
const Widget = dynamic(() => import('@/app/components/Widget'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
  )
});

export default function TestPage() {
  const searchParams = useSearchParams();
  const promptId = searchParams.get('prompt');

  const [prompts, setPrompts] = useState<Array<{ id: number; content: string }>>([]);
  const [promptContent, setPromptContent] = useState<string>('');
  const [selectedPromptId, setSelectedPromptId] = useState<string>('');
  const [widgetData, setWidgetData] = useState<WidgetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [widgetName, setWidgetName] = useState('');
  const [widgetKey, setWidgetKey] = useState(0);
  const [listKey, setListKey] = useState(0);

  useEffect(() => {
    if (promptId) {
      fetchPrompt(promptId);
    } else {
      fetchPrompts();
      setPromptContent(''); // Reset prompt content when no promptId
    }
  }, [promptId]);

  const fetchPrompts = async () => {
    try {
      const response = await fetch('/api/prompts');
      const data = await response.json();
      setPrompts(data.prompts || []);
    } catch (error) {
      console.error('Error fetching prompts:', error);
      setError('Failed to load prompts');
    }
  };

  const fetchPrompt = async (id: string) => {
    try {
      const response = await fetch(`/api/prompts/${id}`);
      const data = await response.json();
      setPromptContent(data.content);
    } catch (error) {
      console.error('Error fetching prompt:', error);
      setError('Failed to load prompt');
    }
  };

  const generateWidget = async () => {
    if (!promptContent?.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: promptContent }),
      });
      
      if (!response.ok) throw new Error('Failed to generate widget');
      
      const data = await response.json();
      setWidgetData(data);
      setWidgetKey(prev => prev + 1);
    } catch (error) {
      console.error('Error generating widget:', error);
      setError('Failed to generate widget. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrompt = async () => {
    if (!promptContent?.trim()) return;

    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: promptContent })
      });
      
      if (response.ok) {
        const data = await response.json();
        window.location.href = `/instruction/${data.id}`;
      } else {
        throw new Error('Failed to save prompt');
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
      setError('Failed to save prompt');
    }
  };

  const handleSaveWidget = () => {
    if (!widgetData || !widgetName.trim() || !promptId) return;
    
    try {
      const savedWidget = widgetStore.saveWidget({
        name: widgetName,
        data: widgetData,
        promptId
      }, promptId);

      window.location.href = `/instruction/${promptId}#${savedWidget.id}`;
      setShowSaveDialog(false);
      setWidgetName('');
      setListKey(prev => prev + 1);
    } catch (error) {
      console.error('Error saving widget:', error);
      alert('Failed to save widget. Please try again.');
    }
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
          {promptId ? 'Edit Prompt' : 'Select a Prompt'}
        </label>
        <div className="flex flex-col gap-4">
          {promptId ? (
            <textarea
              id="prompt"
              value={promptContent}
              onChange={(e) => setPromptContent(e.target.value)}
              className="w-full h-32 p-2 border rounded-md focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter your prompt here..."
            />
          ) : (
            <select
              id="prompt"
              value={selectedPromptId}
              onChange={(e) => {
                setSelectedPromptId(e.target.value);
                const selected = prompts.find(p => String(p.id) === e.target.value);
                if (selected) {
                  setPromptContent(selected.content);
                }
              }}
              className="block w-full rounded-md border p-2 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a prompt...</option>
              {prompts.map((prompt) => (
                <option key={prompt.id} value={prompt.id}>
                  {prompt.content?.substring(0, 100) || ''}...
                </option>
              ))}
            </select>
          )}
          <div className="flex gap-2">
            <button
              onClick={generateWidget}
              disabled={loading || !promptContent?.trim()}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Widget'}
            </button>
            {promptId && (
              <button
                onClick={handleSavePrompt}
                disabled={loading || !promptContent?.trim()}
                className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Save Prompt
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-600 font-medium">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-md hover:bg-red-200"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <LoadingOverlay
          message="Generating Widget..."
          subMessage="Creating your custom component with OpenAI"
        />
      )}

      {widgetData && (
        <div className="space-y-4">
          <Widget key={widgetKey} data={widgetData} />
          <div className="flex justify-end">
            <button
              onClick={() => setShowSaveDialog(true)}
              className="px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600 flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>Save Widget</span>
            </button>
          </div>
        </div>
      )}

      {showSaveDialog && !loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-700">Save Widget</h2>
              <button 
                onClick={() => setShowSaveDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="relative">
                <input
                  type="text"
                  value={widgetName}
                  onChange={(e) => setWidgetName(e.target.value)}
                  placeholder="Enter widget name"
                  className="w-full pl-3 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
                {widgetName && (
                  <button
                    onClick={() => setWidgetName('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={handleSaveWidget}
                  disabled={!widgetName.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save Widget</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 pt-8 border-t">
        <h2 className="text-2xl font-bold mb-6">Saved Widgets</h2>
        <WidgetList key={listKey} />
      </div>
    </div>
  );
}