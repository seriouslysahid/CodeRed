'use client';

import React, { useEffect, useRef } from 'react';
import { clsx } from 'clsx';

export interface LiveRegionProps {
  message?: string;
  priority?: 'polite' | 'assertive';
  clearDelay?: number;
  className?: string;
}

const LiveRegion: React.FC<LiveRegionProps> = ({
  message,
  priority = 'polite',
  clearDelay = 1000,
  className,
}) => {
  const regionRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!message || !regionRef.current) return;

    // Set the message
    regionRef.current.textContent = message;

    // Clear the message after delay to allow for repeated announcements
    if (clearDelay > 0) {
      timeoutRef.current = setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = '';
        }
      }, clearDelay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, clearDelay]);

  return (
    <div
      ref={regionRef}
      aria-live={priority}
      aria-atomic="true"
      className={clsx(
        'sr-only',
        'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
        className
      )}
    />
  );
};

// Hook for using live regions
export function useLiveRegion() {
  const [message, setMessage] = React.useState<string>('');
  const [priority, setPriority] = React.useState<'polite' | 'assertive'>('polite');

  const announce = React.useCallback((
    text: string, 
    announcePriority: 'polite' | 'assertive' = 'polite'
  ) => {
    setPriority(announcePriority);
    setMessage(text);
  }, []);

  const clear = React.useCallback(() => {
    setMessage('');
  }, []);

  return {
    message,
    priority,
    announce,
    clear,
    LiveRegion: () => <LiveRegion message={message} priority={priority} />,
  };
}

export default LiveRegion;