'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Prompt {
  id: number;
  content: string;
  createdAt: string;
}

interface EditModalProps {
  prompt: Prompt;
  onClose: () => void;
  onSave: (content: string) => Promise<void>;
}

function EditModal({ prompt, onClose, onSave }: EditModalProps) {
  const [content, setContent] = useState(prompt.content);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(content);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Edit Prompt</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-32 p-2 border rounded mb-4"
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function PromptList() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);

  const fetchPrompts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/prompts');
      const data = await res.json();
      setPrompts(data.prompts || []);
    } catch (err) {
      console.error('Error fetching prompts:', err);
      setError('Failed to load prompts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;

    try {
      const res = await fetch(`/api/prompts/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        await fetchPrompts();
      } else {
        throw new Error('Failed to delete prompt');
      }
    } catch (err) {
      console.error('Error deleting prompt:', err);
      alert('Failed to delete prompt. Please try again.');
    }
  };

  const handleEdit = async (content: string) => {
    if (!editingPrompt) return;

    try {
      const res = await fetch(`/api/prompts/${editingPrompt.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      if (res.ok) {
        await fetchPrompts();
      } else {
        throw new Error('Failed to update prompt');
      }
    } catch (err) {
      console.error('Error updating prompt:', err);
      alert('Failed to update prompt. Please try again.');
    }
  };

  if (error) {
    return (
      <div className="text-center py-4 text-red-600">
        {error}
        <button
          onClick={fetchPrompts}
          className="ml-4 text-blue-500 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p>Loading prompts...</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {prompts.length === 0 ? (
          <p className="text-center col-span-full">No prompts available.</p>
        ) : (
          prompts.map((prompt) => (
            <div
              key={prompt.id}
              className="border rounded-lg bg-white hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-4">
                <p className="line-clamp-3 mb-2">{prompt.content}</p>
                <p className="text-sm text-gray-500">
                  {new Date(prompt.createdAt).toLocaleDateString()}
                </p>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/instruction/${prompt.id}`}
                    className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 flex-1 text-center"
                  >
                    View
                  </Link>
                  <Link
                    href={`/test?prompt=${prompt.id}`}
                    className="px-3 py-1 text-sm bg-green-100 rounded hover:bg-green-200 flex-1 text-center"
                  >
                    Test
                  </Link>
                  <button
                    onClick={() => setEditingPrompt(prompt)}
                    className="px-3 py-1 text-sm bg-blue-100 rounded hover:bg-blue-200 flex-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(prompt.id)}
                    className="px-3 py-1 text-sm bg-red-100 rounded hover:bg-red-200 flex-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {editingPrompt && (
        <EditModal
          prompt={editingPrompt}
          onClose={() => setEditingPrompt(null)}
          onSave={handleEdit}
        />
      )}
    </>
  );
}