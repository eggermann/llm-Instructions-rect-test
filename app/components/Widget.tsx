'use client';

import { useState } from 'react';
import DynamicRect from './DynamicRect';

interface WidgetData {
  html: string;
  css: string;
  javascript: string;
}

export interface WidgetProps {
  data: WidgetData;
}

export default function Widget({ data }: WidgetProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="mt-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'preview'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('preview')}
            >
              Preview
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'code'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('code')}
            >
              Code
            </button>
          </div>
        </div>

        {activeTab === 'preview' ? (
          <div>
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Generated Banner</h2>
              <button
                onClick={() => setActiveTab('code')}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                View Code
              </button>
            </div>
            <div className="p-6 bg-gray-100">
              <DynamicRect {...data} />
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">HTML</h3>
                  <button
                    onClick={() => copyToClipboard(data.html)}
                    className="text-sm text-blue-500 hover:text-blue-600"
                  >
                    Copy
                  </button>
                </div>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                  {data.html}
                </pre>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">CSS</h3>
                  <button
                    onClick={() => copyToClipboard(data.css)}
                    className="text-sm text-blue-500 hover:text-blue-600"
                  >
                    Copy
                  </button>
                </div>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                  {data.css}
                </pre>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">JavaScript</h3>
                  <button
                    onClick={() => copyToClipboard(data.javascript)}
                    className="text-sm text-blue-500 hover:text-blue-600"
                  >
                    Copy
                  </button>
                </div>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                  {data.javascript}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}