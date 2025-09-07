'use client';

import React, { useEffect } from 'react';
import { usePrefetch } from '@/hooks/usePerformance';

export interface PrefetchProps {
  href: string;
  as?: 'script' | 'style' | 'image' | 'fetch';
  type?: 'prefetch' | 'preload';
  condition?: boolean;
}

const Prefetch: React.FC<PrefetchProps> = ({
  href,
  as = 'fetch',
  type = 'prefetch',
  condition = true,
}) => {
  const { prefetch, preload } = usePrefetch();

  useEffect(() => {
    if (!condition) return;

    if (type === 'prefetch') {
      prefetch(href, as);
    } else {
      preload(href, as);
    }
  }, [href, as, type, condition, prefetch, preload]);

  return null; // This component doesn't render anything
};

// Hook for prefetching on hover
export function usePrefetchOnHover() {
  const { prefetch } = usePrefetch();

  const handleMouseEnter = React.useCallback((href: string, as?: 'script' | 'style' | 'image' | 'fetch') => {
    prefetch(href, as);
  }, [prefetch]);

  return { prefetchOnHover: handleMouseEnter };
}

// Component for prefetching on hover
export interface PrefetchOnHoverProps {
  href: string;
  as?: 'script' | 'style' | 'image' | 'fetch';
  children: React.ReactElement;
}

export const PrefetchOnHover: React.FC<PrefetchOnHoverProps> = ({
  href,
  as = 'fetch',
  children,
}) => {
  const { prefetchOnHover } = usePrefetchOnHover();

  return React.cloneElement(children, {
    onMouseEnter: (e: React.MouseEvent) => {
      prefetchOnHover(href, as);
      children.props.onMouseEnter?.(e);
    },
  });
};

export default Prefetch;