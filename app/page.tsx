
import { useState } from 'react';
import { PromptList } from './components/PromptList';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [promptInput, setPromptInput] = useState('');

  const [key, setKey] = useState(0); // Add key for forcing re-render

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
        setKey(prev => prev + 1); // Force PromptList to re-render
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
          <div className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Enter your prompt... (You can include URLs to scrape content)"
                className="flex-1 p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-sm"
                >
                  Add Prompt
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/test?prompt=${encodeURIComponent(promptInput)}`)}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-sm"
                >
                  Test Widget
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Tip: Include URLs in your prompt to automatically scrape and incorporate content.
              For example: "Create a banner for this product: https://example.com/product"
            </p>
          </div>
        </form>

        <PromptList key={key} />
      </div>
    </>
  );
}