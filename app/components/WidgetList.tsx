'use client';

import { useEffect, useState } from 'react';
import { SavedWidget, widgetStore } from '../utils/widgetStore';
import Widget, { WidgetData } from './Widget';
import LoadingOverlay from './LoadingOverlay';

interface WidgetPreviewProps {
  widget: SavedWidget;
  onSave: (id: string, data: WidgetData) => void;
  updating: string | null;
  error: { id: string; message: string } | null;
}

function WidgetPreview({ widget, onSave, updating, error }: WidgetPreviewProps) {
  const [previewKey, setPreviewKey] = useState(0);

  // Force re-render of widget when data changes
  useEffect(() => {
    setPreviewKey(prev => prev + 1);
  }, [widget.data]);

  return (
    <div className="p-4 relative">
      {updating === widget.id && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-blue-500">Updating widget...</span>
          </div>
        </div>
      )}
      <Widget
        key={previewKey}
        data={widget.data}
        onSave={(updatedData) => onSave(widget.id, updatedData)}
      />
      {error?.id === widget.id && (
        <div className="mt-2 p-2 bg-red-50 text-red-600 text-sm rounded border border-red-200">
          {error.message}
        </div>
      )}
    </div>
  );
}

export default function WidgetList() {
  const [widgets, setWidgets] = useState<SavedWidget[]>([]);
  const [activeWidgetId, setActiveWidgetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<{id: string; message: string} | null>(null);

  useEffect(() => {
    loadWidgets();
  }, []);

  const loadWidgets = async () => {
    setLoading(true);
    setError(null);
    try {
      const savedWidgets = widgetStore.getWidgets();
      setWidgets(savedWidgets);
    } catch (error) {
      setError('Failed to load widgets');
      console.error('Error loading widgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this widget?')) return;
    
    setDeleting(id);
    setActionError(null);
    try {
      widgetStore.deleteWidget(id);
      await loadWidgets();
      if (activeWidgetId === id) {
        setActiveWidgetId(null);
      }
    } catch (error) {
      setActionError({ id, message: 'Failed to delete widget' });
      console.error('Error deleting widget:', error);
    } finally {
      setDeleting(null);
    }
  };

  const handleSave = async (widgetId: string, data: WidgetData) => {
    setUpdating(widgetId);
    setActionError(null);
    try {
      await widgetStore.updateWidget(widgetId, { data });
      await loadWidgets();
    } catch (error) {
      setActionError({ id: widgetId, message: 'Failed to update widget' });
      console.error('Error updating widget:', error);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-8 relative min-h-[100px]">
      {loading && <LoadingOverlay message="Loading widgets..." />}
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center justify-between">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadWidgets}
              className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-md hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      {widgets.length === 0 ? (
        <p className="text-center text-gray-500">No saved widgets yet.</p>
      ) : (
        widgets.map((widget) => (
          <div key={widget.id} className="border rounded-lg bg-white shadow-sm">
            <div className="border-b px-4 py-3 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h3 className="font-medium">{widget.name}</h3>
                <span className="text-sm text-gray-500">
                  {new Date(widget.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => setActiveWidgetId(activeWidgetId === widget.id ? null : widget.id)}
                  className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                >
                  {activeWidgetId === widget.id ? 'Hide' : 'Show'}
                </button>
                <div className="flex items-center space-x-2">
                  {actionError?.id === widget.id && (
                    <span className="text-sm text-red-500">{actionError.message}</span>
                  )}
                  <button
                    onClick={() => handleDelete(widget.id)}
                    disabled={deleting === widget.id}
                    className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 disabled:opacity-50 flex items-center space-x-1"
                  >
                    {deleting === widget.id ? (
                      <>
                        <div className="w-3 h-3 border-t-2 border-red-600 rounded-full animate-spin"></div>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
            {activeWidgetId === widget.id && (
              <WidgetPreview
                widget={widget}
                onSave={handleSave}
                updating={updating}
                error={actionError}
              />
            )}
          </div>
        ))
      )}
    </div>
  );
}