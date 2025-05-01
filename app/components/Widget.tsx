'use client';

import { useEffect, useRef } from 'react';

interface WidgetData {
  html: string;
  css: string;
  javascript: string;
}

export interface WidgetProps {
  data: WidgetData;
}

export default function Widget({ data }: WidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous content
    containerRef.current.innerHTML = '';

    // Create and append style element
    const styleElement = document.createElement('style');
    styleElement.textContent = data.css;
    containerRef.current.appendChild(styleElement);

    // Create sandbox container for widget content
    const sandboxContainer = document.createElement('div');
    sandboxContainer.innerHTML = data.html;
    containerRef.current.appendChild(sandboxContainer);

    // Create and execute script in a safe way
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.text = `
      try {
        (function() {
          ${data.javascript}
        })();
      } catch (error) {
        console.error('Widget script error:', error);
      }
    `;
    containerRef.current.appendChild(script);

    // Cleanup function
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [data]);

  return (
    <div className="mt-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Generated Widget</h2>
          <div className="space-x-2">
            <button
              onClick={() => {
                if (containerRef.current) {
                  containerRef.current.innerHTML = '';
                  const styleElement = document.createElement('style');
                  styleElement.textContent = data.css;
                  containerRef.current.appendChild(styleElement);
                  const sandboxContainer = document.createElement('div');
                  sandboxContainer.innerHTML = data.html;
                  containerRef.current.appendChild(sandboxContainer);
                  const script = document.createElement('script');
                  script.type = 'text/javascript';
                  script.text = `
                    try {
                      (function() {
                        ${data.javascript}
                      })();
                    } catch (error) {
                      console.error('Widget script error:', error);
                    }
                  `;
                  containerRef.current.appendChild(script);
                }
              }}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              Reload
            </button>
          </div>
        </div>
        <div className="border-b bg-gray-50 p-2">
          <p className="text-xs text-gray-500">Preview of the generated component</p>
        </div>
        <div 
          ref={containerRef}
          className="p-6 min-h-[200px] relative bg-white"
        />
      </div>
    </div>
  );
}