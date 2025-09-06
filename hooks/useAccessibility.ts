'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

// Hook for managing focus
export function useFocusManagement() {
  const focusableElementsSelector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  const getFocusableElements = useCallback((container: HTMLElement) => {
    return Array.from(container.querySelectorAll(focusableElementsSelector)) as HTMLElement[];
  }, [focusableElementsSelector]);

  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    
    // Focus first element
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [getFocusableElements]);

  const restoreFocus = useCallback((element: HTMLElement | null) => {
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  }, []);

  return {
    getFocusableElements,
    trapFocus,
    restoreFocus,
  };
}

// Hook for keyboard navigation
export function useKeyboardNavigation(
  items: any[],
  options: {
    onSelect?: (index: number, item: any) => void;
    onEscape?: () => void;
    loop?: boolean;
    orientation?: 'horizontal' | 'vertical';
  } = {}
) {
  const { onSelect, onEscape, loop = true, orientation = 'vertical' } = options;
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isVertical = orientation === 'vertical';
    const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
    const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';

    switch (e.key) {
      case nextKey:
        e.preventDefault();
        setActiveIndex(prev => {
          const next = prev + 1;
          if (next >= items.length) {
            return loop ? 0 : prev;
          }
          return next;
        });
        break;

      case prevKey:
        e.preventDefault();
        setActiveIndex(prev => {
          const next = prev - 1;
          if (next < 0) {
            return loop ? items.length - 1 : 0;
          }
          return next;
        });
        break;

      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;

      case 'End':
        e.preventDefault();
        setActiveIndex(items.length - 1);
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < items.length) {
          onSelect?.(activeIndex, items[activeIndex]);
        }
        break;

      case 'Escape':
        e.preventDefault();
        onEscape?.();
        break;
    }
  }, [items, activeIndex, onSelect, onEscape, loop, orientation]);

  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown,
  };
}

// Hook for screen reader announcements
export function useScreenReader() {
  const announcementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create announcement element if it doesn't exist
    if (!announcementRef.current) {
      const element = document.createElement('div');
      element.setAttribute('aria-live', 'polite');
      element.setAttribute('aria-atomic', 'true');
      element.className = 'sr-only';
      element.style.cssText = `
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      `;
      document.body.appendChild(element);
      announcementRef.current = element;
    }

    return () => {
      if (announcementRef.current) {
        document.body.removeChild(announcementRef.current);
        announcementRef.current = null;
      }
    };
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcementRef.current) {
      announcementRef.current.setAttribute('aria-live', priority);
      announcementRef.current.textContent = message;
      
      // Clear after announcement to allow repeated announcements
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  return { announce };
}

// Hook for managing ARIA attributes
export function useAriaAttributes() {
  const generateId = useCallback((prefix = 'aria') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const createAriaProps = useCallback((
    options: {
      label?: string;
      labelledBy?: string;
      describedBy?: string;
      expanded?: boolean;
      selected?: boolean;
      checked?: boolean;
      disabled?: boolean;
      required?: boolean;
      invalid?: boolean;
      live?: 'off' | 'polite' | 'assertive';
      role?: string;
    } = {}
  ) => {
    const props: Record<string, any> = {};

    if (options.label) props['aria-label'] = options.label;
    if (options.labelledBy) props['aria-labelledby'] = options.labelledBy;
    if (options.describedBy) props['aria-describedby'] = options.describedBy;
    if (options.expanded !== undefined) props['aria-expanded'] = options.expanded;
    if (options.selected !== undefined) props['aria-selected'] = options.selected;
    if (options.checked !== undefined) props['aria-checked'] = options.checked;
    if (options.disabled !== undefined) props['aria-disabled'] = options.disabled;
    if (options.required !== undefined) props['aria-required'] = options.required;
    if (options.invalid !== undefined) props['aria-invalid'] = options.invalid;
    if (options.live) props['aria-live'] = options.live;
    if (options.role) props['role'] = options.role;

    return props;
  }, []);

  return {
    generateId,
    createAriaProps,
  };
}

// Hook for detecting reduced motion preference
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// Hook for high contrast mode detection
export function useHighContrast() {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setPrefersHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersHighContrast;
}

// Hook for managing skip links
export function useSkipLinks() {
  const skipLinksRef = useRef<HTMLElement[]>([]);

  const registerSkipLink = useCallback((element: HTMLElement) => {
    skipLinksRef.current.push(element);
    return () => {
      skipLinksRef.current = skipLinksRef.current.filter(el => el !== element);
    };
  }, []);

  const focusSkipTarget = useCallback((targetId: string) => {
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return {
    registerSkipLink,
    focusSkipTarget,
  };
}

// Hook for color contrast validation
export function useColorContrast() {
  const calculateContrast = useCallback((color1: string, color2: string) => {
    // Simple contrast calculation - in production, use a proper library
    const getLuminance = (color: string) => {
      // This is a simplified version - use a proper color library in production
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;
      
      const sRGB = [r, g, b].map(c => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    };

    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }, []);

  const meetsWCAG = useCallback((contrast: number, level: 'AA' | 'AAA' = 'AA') => {
    const threshold = level === 'AAA' ? 7 : 4.5;
    return contrast >= threshold;
  }, []);

  return {
    calculateContrast,
    meetsWCAG,
  };
}