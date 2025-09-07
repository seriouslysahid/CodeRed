'use client';

import React, { useMemo } from 'react';
import { clsx } from 'clsx';
import { useVirtualScrolling } from '@/hooks/usePerformance';

export interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
}

function VirtualList<T>({
  items,
  itemHeight,
  height,
  renderItem,
  className,
  overscan = 5,
  onScroll,
}: VirtualListProps<T>) {
  const {
    visibleItems,
    totalHeight,
    offsetY,
    startIndex,
    handleScroll,
  } = useVirtualScrolling(items, itemHeight, height, overscan);

  const handleScrollEvent = (e: React.UIEvent<HTMLDivElement>) => {
    handleScroll(e);
    onScroll?.(e.currentTarget.scrollTop);
  };

  const visibleItemsWithIndex = useMemo(() => {
    return visibleItems.map((item, index) => ({
      item,
      originalIndex: startIndex + index,
    }));
  }, [visibleItems, startIndex]);

  return (
    <div
      className={clsx('overflow-auto', className)}
      style={{ height }}
      onScroll={handleScrollEvent}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItemsWithIndex.map(({ item, originalIndex }) => (
            <div
              key={originalIndex}
              style={{ height: itemHeight }}
              className="flex items-center"
            >
              {renderItem(item, originalIndex)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VirtualList;