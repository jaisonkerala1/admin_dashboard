import React, { useMemo } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  height?: number;
  className?: string;
  overscanCount?: number;
}

/**
 * VirtualizedList component for rendering large lists efficiently
 * Uses react-window to only render visible items
 */
export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight = 60,
  height = 600,
  className = '',
  overscanCount = 5,
}: VirtualizedListProps<T>) {
  const Row = useMemo(
    () => (props: ListChildComponentProps) => {
      const { index, style } = props;
      const item = items[index];
      
      return (
        <div style={style} className="px-4">
          {renderItem(item, index)}
        </div>
      );
    },
    [items, renderItem]
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <List
        height={height}
        itemCount={items.length}
        itemSize={itemHeight}
        width="100%"
        overscanCount={overscanCount}
      >
        {Row}
      </List>
    </div>
  );
}

