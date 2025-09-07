'use client';

import React, { useEffect, useRef } from 'react';
import { useFocusManagement } from '@/hooks/useAccessibility';

export interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  restoreFocus?: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
  className?: string;
}

const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  active = true,
  restoreFocus = true,
  initialFocus,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const { trapFocus, restoreFocus: restoreFocusUtil } = useFocusManagement();

  useEffect(() => {
    if (!active || !containerRef.current) return;

    // Store the currently focused element
    previousActiveElementRef.current = document.activeElement as HTMLElement;

    // Set up focus trap
    const cleanup = trapFocus(containerRef.current);

    // Focus initial element if specified
    if (initialFocus?.current) {
      initialFocus.current.focus();
    }

    return () => {
      cleanup();
      
      // Restore focus to previous element
      if (restoreFocus && previousActiveElementRef.current) {
        restoreFocusUtil(previousActiveElementRef.current);
      }
    };
  }, [active, trapFocus, restoreFocusUtil, restoreFocus, initialFocus]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

export default FocusTrap;