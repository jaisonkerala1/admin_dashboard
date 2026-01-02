import React, { useMemo } from 'react';
import { VariableSizeList as List, ListChildComponentProps } from 'react-window';

interface VirtualizedTableProps<T> {
  items: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
  rowHeight?: number | ((index: number) => number);
  height?: number;
  className?: string;
  header?: React.ReactNode;
  overscanCount?: number;
}

/**
 * VirtualizedTable component for rendering large tables efficiently
 * Uses react-window with variable row heights
 */
export function VirtualizedTable<T>({
  items,
  renderRow,
  rowHeight = 60,
  height = 600,
  className = '',
  header,
  overscanCount = 5,
}: VirtualizedTableProps<T>) {
  const getItemSize = useMemo(() => {
    if (typeof rowHeight === 'function') {
      return rowHeight;
    }
    return () => rowHeight;
  }, [rowHeight]);

  const Row = useMemo(
    () => (props: ListChildComponentProps) => {
      const { index, style } = props;
      const item = items[index];
      
      return (
        <div style={style}>
          {renderRow(item, index)}
        </div>
      );
    },
    [items, renderRow]
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {header}
      <List
        height={height}
        itemCount={items.length}
        itemSize={getItemSize}
        width="100%"
        overscanCount={overscanCount}
      >
        {Row}
      </List>
    </div>
  );
}

