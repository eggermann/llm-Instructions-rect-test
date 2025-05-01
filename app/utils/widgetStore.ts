import { logger } from './logger';

export interface SavedWidget {
  id: string;
  name: string;
  createdAt: string;
  promptId: string;  // Add promptId to track which prompt generated this widget
  data: {
    html: string;
    css: string;
    javascript: string;
  };
}

class WidgetStore {
  private readonly storageKey = 'saved_widgets';

  getWidgets(): SavedWidget[] {
    try {
      if (typeof window === 'undefined') return [];
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      logger.error('Error loading widgets', { error });
      return [];
    }
  }

  saveWidget(widget: Omit<SavedWidget, 'id' | 'createdAt'>, promptId: string): SavedWidget {
    try {
      const widgets = this.getWidgets();
      const newWidget: SavedWidget = {
        ...widget,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        promptId
      };

      widgets.push(newWidget);
      localStorage.setItem(this.storageKey, JSON.stringify(widgets));
      logger.info('Widget saved successfully', { widgetId: newWidget.id });
      
      return newWidget;
    } catch (error) {
      logger.error('Error saving widget', { error });
      throw new Error('Failed to save widget');
    }
  }

  // Add method to get widgets for a specific prompt
  getWidgetsByPromptId(promptId: string): SavedWidget[] {
    try {
      const widgets = this.getWidgets();
      return widgets.filter(widget => widget.promptId === promptId);
    } catch (error) {
      logger.error('Error getting widgets by promptId', { error, promptId });
      return [];
    }
  }

  deleteWidget(id: string): void {
    try {
      const widgets = this.getWidgets();
      const filteredWidgets = widgets.filter(w => w.id !== id);
      localStorage.setItem(this.storageKey, JSON.stringify(filteredWidgets));
      logger.info('Widget deleted successfully', { widgetId: id });
    } catch (error) {
      logger.error('Error deleting widget', { error });
      throw new Error('Failed to delete widget');
    }
  }

  updateWidget(id: string, data: Partial<SavedWidget>): SavedWidget {
    try {
      const widgets = this.getWidgets();
      const index = widgets.findIndex(w => w.id === id);
      
      if (index === -1) {
        throw new Error('Widget not found');
      }

      const updatedWidget = {
        ...widgets[index],
        ...data,
        id, // Ensure ID doesn't change
      };

      widgets[index] = updatedWidget;
      localStorage.setItem(this.storageKey, JSON.stringify(widgets));
      logger.info('Widget updated successfully', { widgetId: id });

      return updatedWidget;
    } catch (error) {
      logger.error('Error updating widget', { error });
      throw new Error('Failed to update widget');
    }
  }
}

export const widgetStore = new WidgetStore();