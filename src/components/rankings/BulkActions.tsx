import { Pin, EyeOff, Eye, X } from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  onPin: () => void;
  onUnpin: () => void;
  onHide: () => void;
  onUnhide: () => void;
  onClearSelection: () => void;
}

export const BulkActions = ({
  selectedCount,
  onPin,
  onUnpin,
  onHide,
  onUnhide,
  onClearSelection,
}: BulkActionsProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
          {selectedCount} astrologer{selectedCount !== 1 ? 's' : ''} selected
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onPin}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 rounded-lg transition-colors"
        >
          <Pin className="w-4 h-4" />
          Pin
        </button>
        <button
          onClick={onUnpin}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 rounded-lg transition-colors"
        >
          <Pin className="w-4 h-4" />
          Unpin
        </button>
        <button
          onClick={onHide}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg transition-colors"
        >
          <EyeOff className="w-4 h-4" />
          Hide
        </button>
        <button
          onClick={onUnhide}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-lg transition-colors"
        >
          <Eye className="w-4 h-4" />
          Unhide
        </button>
        <button
          onClick={onClearSelection}
          className="p-1.5 text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground hover:bg-gray-200 dark:hover:bg-muted rounded-lg transition-colors"
          title="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

