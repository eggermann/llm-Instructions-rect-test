'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { widgetStore, SavedWidget } from '@/app/utils/widgetStore';
import Widget from '@/app/components/Widget';
import LoadingOverlay from '@/app/components/LoadingOverlay';

interface Prompt {
  id: string;
  content: string;
  createdAt: string;
}

export default function InstructionPage() {
  const params = useParams();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [savedWidgets, setSavedWidgets] = useState<SavedWidget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeWidgetId, setActiveWidgetId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterName, setFilterName] = useState('');
  const [loadingPreview, setLoadingPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchPromptDetails();
    loadSavedWidgets();
  }, [params.id]);

  // Handle URL hash for auto-opening widgets
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const widgetId = window.location.hash.slice(1);
      if (widgetId) {
        setActiveWidgetId(widgetId);
        // Scroll to the widget after a short delay to ensure it's rendered
        setTimeout(() => {
          const element = document.getElementById(`widget-${widgetId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 500);
      }
    }
  }, [savedWidgets]);

  const fetchPromptDetails = async () => {
    try {
      const response = await fetch(`/api/prompts/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch prompt details');
      const data = await response.json();
      setPrompt(data);
    } catch (error) {
      setError('Failed to load prompt details');
      console.error('Error:', error);
    }
  };

  const loadSavedWidgets = () => {
    try {
      const promptWidgets = widgetStore.getWidgetsByPromptId(String(params.id));
      setSavedWidgets(promptWidgets);
      setLoading(false);
    } catch (error) {
      setError('Failed to load saved widgets');
      console.error('Error:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingOverlay message="Loading portfolio..." />;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/" className="text-blue-500 hover:text-blue-600 mb-2 inline-block">
            ← Back to Prompts
          </Link>
          <h1 className="text-3xl font-bold">Prompt Portfolio</h1>
        </div>
        <Link
          href={`/test?prompt=${params.id}`}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Generate New Widget
        </Link>
      </div>

      {/* Portfolio Summary */}
      {prompt && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white p-6 rounded-lg shadow-sm border col-span-2">
            <h2 className="text-lg font-semibold mb-2">Prompt</h2>
            <p className="text-gray-700">{prompt.content}</p>
            <p className="text-sm text-gray-500 mt-2">
              Created on {new Date(prompt.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Stats</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Total Generations</p>
                <p className="text-2xl font-semibold">{savedWidgets.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Latest Generation</p>
                <p className="text-base">
                  {savedWidgets.length > 0 
                    ? new Date(savedWidgets[0].createdAt).toLocaleDateString()
                    : 'No generations yet'}
                </p>
              </div>
              <div className="pt-3 border-t">
                <Link
                  href={`/test?prompt=${params.id}`}
                  className="inline-flex items-center text-sm text-blue-500 hover:text-blue-600"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create New Generation
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved Generations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Saved Generations</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Filter by name..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="w-48 px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {filterName && (
                <button
                  onClick={() => setFilterName('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
            >
              <span>Sort by date</span>
              {sortOrder === 'desc' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {savedWidgets.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <p className="text-gray-500">No saved generations yet.</p>
            <Link
              href={`/test?prompt=${params.id}`}
              className="text-blue-500 hover:text-blue-600 mt-2 inline-block"
            >
              Create your first generation
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {savedWidgets
              .filter(widget => 
                filterName ? widget.name.toLowerCase().includes(filterName.toLowerCase()) : true
              )
              .sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
              })
              .map((widget) => (
                <div
                  id={`widget-${widget.id}`}
                  key={widget.id}
                  className={`group bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-all duration-200 ${
                    widget.id === activeWidgetId ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium group-hover:text-blue-600 transition-colors">{widget.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Saved on {new Date(widget.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            const code = `HTML:\n${widget.data.html}\n\nCSS:\n${widget.data.css}\n\nJavaScript:\n${widget.data.javascript}`;
                            navigator.clipboard.writeText(code);
                            alert('Widget code copied to clipboard!');
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Copy code"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={async () => {
                            if (activeWidgetId === widget.id) {
                              setActiveWidgetId(null);
                            } else {
                              setLoadingPreview(widget.id);
                              setActiveWidgetId(widget.id);
                              await new Promise(resolve => setTimeout(resolve, 300));
                              setLoadingPreview(null);
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title={activeWidgetId === widget.id ? 'Hide preview' : 'Show preview'}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d={activeWidgetId === widget.id ? 
                                "M19 9l-7 7-7-7" : 
                                "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              }
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1.5 3 3 3h10c1.5 0 3-1 3-3V7c0-2-1.5-3-3-3H7c-1.5 0-3 1-3 3z" />
                        </svg>
                        {(widget.data.html.length + widget.data.css.length + widget.data.javascript.length).toLocaleString()} chars
                      </span>
                    </div>
                  </div>

                  <div className={`border-t transition-all duration-300 ease-in-out ${
                    activeWidgetId === widget.id ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                  }`}>
                    {loadingPreview === widget.id ? (
                      <div className="p-8 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <div className="p-4">
                        <Widget data={widget.data} />
                        <div className="mt-4 pt-4 border-t flex justify-end gap-2">
                          <button
                            onClick={() => {
                              const code = `HTML:\n${widget.data.html}\n\nCSS:\n${widget.data.css}\n\nJavaScript:\n${widget.data.javascript}`;
                              navigator.clipboard.writeText(code);
                              alert('Widget code copied to clipboard!');
                            }}
                            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                          >
                            Copy Code
                          </button>
                          <Link
                            href={`/test?prompt=${params.id}`}
                            className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Generate New
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}