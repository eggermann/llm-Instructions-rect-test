'use client';

import { useState } from 'react';
import DynamicRect from './DynamicRect';

export interface WidgetData {
  html: string;
  css: string;
  javascript: string;
  description?: string;
  imageUrl?: string;
}

export interface WidgetProps {
  data: WidgetData;
  onSave?: (data: WidgetData) => void;
}

type TabType = 'preview' | 'code' | 'edit';
type EditTabType = 'html' | 'css' | 'js';

const Widget: React.FC<WidgetProps> = ({ data, onSave }) => {
  const [activeTab, setActiveTab] = useState<TabType>('preview');
  const [editTab, setEditTab] = useState<EditTabType>('html');
  const [editedData, setEditedData] = useState<WidgetData>(data);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleEdit = (field: EditTabType, value: string) => {
    setEditedData(prev => ({
      ...prev,
      [field === 'js' ? 'javascript' : field]: value
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editedData);
    }
    setActiveTab('preview');
  };

  return (
    <div className="mt-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            {[
              { id: 'preview', label: 'Preview' },
              { id: 'code', label: 'Code' },
              { id: 'edit', label: 'Edit' }
            ].map(({ id, label }) => (
              <button
                key={id}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 hover:text-secondary'
                }`}
                onClick={() => setActiveTab(id as TabType)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'preview' && (
          <div>
            <div className="p-4 bg-gray-50 border-b flex flex-wrap justify-between items-center gap-2">
              <h2 className="text-lg font-semibold">Generated Banner</h2>
              <div className="space-x-2">
                <button
                  onClick={() => setActiveTab('code')}
                  className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary-dark"
                >
                  View Code
                </button>
                {onSave && (
                  <button
                    onClick={() => handleSave()}
                    className="px-3 py-1 text-sm bg-secondary text-white rounded hover:bg-secondary-dark"
                  >
                    Save Changes
                  </button>
                )}
              </div>
            </div>
            <div className="p-6 bg-gray-100 relative">
              {editedData.description && (
                <p className="text-sm text-gray-600 mb-4">{editedData.description}</p>
              )}
              <DynamicRect {...editedData} />
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="p-6">
            <div className="space-y-6">
              {[
                { title: 'Description', field: 'description' as const, show: Boolean(editedData.description) },
                { title: 'HTML', field: 'html' as const, show: true },
                { title: 'CSS', field: 'css' as const, show: true },
                { title: 'JavaScript', field: 'javascript' as const, show: true },
              ].filter(({ show }) => show).map(({ title, field }) => (
                <div key={field}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">{title}</h3>
                    <div className="space-x-2">
                      <button
                        onClick={() => {
                          setEditTab(field === 'javascript' ? 'js' : field as EditTabType);
                          setActiveTab('edit');
                        }}
                        className="text-sm text-blue-500 hover:text-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => copyToClipboard(editedData[field] || '')}
                        className="text-sm text-blue-500 hover:text-blue-600"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                    {editedData[field]}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'edit' && (
          <div className="p-6">
            <div className="mb-4 border-b">
              <div className="flex gap-4">
                {(['html', 'css', 'js'] as const).map((tab) => (
                  <button
                    key={tab}
                    className={`px-3 py-2 text-sm ${
                      editTab === tab
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-gray-500 hover:text-secondary'
                    }`}
                    onClick={() => setEditTab(tab)}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <textarea
                value={editTab === 'js' ? editedData.javascript : editedData[editTab]}
                onChange={(e) => handleEdit(editTab, e.target.value)}
                className="w-full h-64 font-mono text-sm p-4 border rounded-lg"
                placeholder={`Enter ${editTab.toUpperCase()} code...`}
              />
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setEditedData(data);
                    setActiveTab('preview');
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm bg-primary text-white rounded hover:bg-primary-dark"
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Widget;