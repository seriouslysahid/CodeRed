'use client';

import React, { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { useColorContrast } from '@/hooks/useAccessibility';

export interface AccessibilityIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  element?: HTMLElement;
  suggestion?: string;
}

export interface AccessibilityCheckerProps {
  enabled?: boolean;
  showInProduction?: boolean;
  className?: string;
}

const AccessibilityChecker: React.FC<AccessibilityCheckerProps> = ({
  enabled = process.env.NODE_ENV === 'development',
  showInProduction = false,
  className,
}) => {
  const [issues, setIssues] = useState<AccessibilityIssue[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const { calculateContrast, meetsWCAG } = useColorContrast();

  const shouldShow = enabled && (process.env.NODE_ENV === 'development' || showInProduction);

  useEffect(() => {
    if (!shouldShow) return;

    const checkAccessibility = () => {
      const foundIssues: AccessibilityIssue[] = [];

      // Check for missing alt text on images
      const images = document.querySelectorAll('img');
      images.forEach((img, index) => {
        if (!img.alt && !img.getAttribute('aria-label')) {
          foundIssues.push({
            id: `img-alt-${index}`,
            type: 'error',
            message: 'Image missing alt text',
            element: img,
            suggestion: 'Add descriptive alt text or aria-label to images',
          });
        }
      });

      // Check for missing form labels
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach((input, index) => {
        const hasLabel = input.getAttribute('aria-label') || 
                         input.getAttribute('aria-labelledby') ||
                         document.querySelector(`label[for="${input.id}"]`);
        
        if (!hasLabel) {
          foundIssues.push({
            id: `input-label-${index}`,
            type: 'error',
            message: 'Form control missing label',
            element: input as HTMLElement,
            suggestion: 'Add a label element or aria-label attribute',
          });
        }
      });

      // Check for missing heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let previousLevel = 0;
      headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1));
        if (level > previousLevel + 1) {
          foundIssues.push({
            id: `heading-hierarchy-${index}`,
            type: 'warning',
            message: `Heading level skipped (h${previousLevel} to h${level})`,
            element: heading as HTMLElement,
            suggestion: 'Use heading levels in sequential order',
          });
        }
        previousLevel = level;
      });

      // Check for buttons without accessible names
      const buttons = document.querySelectorAll('button');
      buttons.forEach((button, index) => {
        const hasAccessibleName = button.textContent?.trim() ||
                                 button.getAttribute('aria-label') ||
                                 button.getAttribute('aria-labelledby');
        
        if (!hasAccessibleName) {
          foundIssues.push({
            id: `button-name-${index}`,
            type: 'error',
            message: 'Button missing accessible name',
            element: button,
            suggestion: 'Add text content or aria-label to buttons',
          });
        }
      });

      // Check for links without accessible names
      const links = document.querySelectorAll('a');
      links.forEach((link, index) => {
        const hasAccessibleName = link.textContent?.trim() ||
                                 link.getAttribute('aria-label') ||
                                 link.getAttribute('aria-labelledby');
        
        if (!hasAccessibleName) {
          foundIssues.push({
            id: `link-name-${index}`,
            type: 'error',
            message: 'Link missing accessible name',
            element: link,
            suggestion: 'Add descriptive text or aria-label to links',
          });
        }
      });

      // Check for missing landmarks
      const main = document.querySelector('main');
      if (!main) {
        foundIssues.push({
          id: 'missing-main',
          type: 'warning',
          message: 'Page missing main landmark',
          suggestion: 'Add a <main> element to identify the primary content',
        });
      }

      // Check for color contrast (simplified check)
      const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button');
      textElements.forEach((element, index) => {
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        // Only check if we have both colors and they're not transparent
        if (color && backgroundColor && 
            color !== 'rgba(0, 0, 0, 0)' && 
            backgroundColor !== 'rgba(0, 0, 0, 0)') {
          
          try {
            // This is a simplified check - in production, use a proper color library
            const contrast = calculateContrast(color, backgroundColor);
            if (!meetsWCAG(contrast)) {
              foundIssues.push({
                id: `contrast-${index}`,
                type: 'warning',
                message: `Low color contrast ratio: ${contrast.toFixed(2)}:1`,
                element: element as HTMLElement,
                suggestion: 'Ensure color contrast meets WCAG AA standards (4.5:1)',
              });
            }
          } catch (error) {
            // Ignore color parsing errors
          }
        }
      });

      setIssues(foundIssues);
    };

    // Run initial check
    checkAccessibility();

    // Set up observer for DOM changes
    const observer = new MutationObserver(() => {
      setTimeout(checkAccessibility, 100); // Debounce
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [shouldShow, calculateContrast, meetsWCAG]);

  const handleHighlightElement = (element?: HTMLElement) => {
    if (!element) return;

    // Remove existing highlights
    document.querySelectorAll('.a11y-highlight').forEach(el => {
      el.classList.remove('a11y-highlight');
    });

    // Add highlight to target element
    element.classList.add('a11y-highlight');
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Remove highlight after 3 seconds
    setTimeout(() => {
      element.classList.remove('a11y-highlight');
    }, 3000);
  };

  const getIssueIcon = (type: AccessibilityIssue['type']) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getIssueBadge = (type: AccessibilityIssue['type']) => {
    switch (type) {
      case 'error':
        return <Badge variant="danger" size="sm">Error</Badge>;
      case 'warning':
        return <Badge variant="warning" size="sm">Warning</Badge>;
      case 'info':
        return <Badge variant="info" size="sm">Info</Badge>;
    }
  };

  if (!shouldShow) return null;

  const errorCount = issues.filter(issue => issue.type === 'error').length;
  const warningCount = issues.filter(issue => issue.type === 'warning').length;

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={clsx(
          'fixed bottom-4 right-4 z-50 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
          className
        )}
        aria-label={`Accessibility checker: ${errorCount} errors, ${warningCount} warnings`}
      >
        <AlertTriangle className="w-5 h-5" />
        {(errorCount > 0 || warningCount > 0) && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {errorCount + warningCount}
          </span>
        )}
      </button>

      {/* Issues panel */}
      {isVisible && (
        <div className="fixed bottom-20 right-4 z-50 w-96 max-h-96 overflow-hidden">
          <Card padding="md" className="bg-white shadow-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Accessibility Issues
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Summary */}
            <div className="flex items-center space-x-4 mb-4 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span>{errorCount} Errors</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span>{warningCount} Warnings</span>
              </div>
            </div>

            {/* Issues list */}
            <div className="max-h-64 overflow-y-auto space-y-2">
              {issues.length === 0 ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">No accessibility issues found!</span>
                </div>
              ) : (
                issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleHighlightElement(issue.element)}
                  >
                    <div className="flex items-start space-x-2">
                      {getIssueIcon(issue.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900">
                            {issue.message}
                          </p>
                          {getIssueBadge(issue.type)}
                        </div>
                        {issue.suggestion && (
                          <p className="text-xs text-gray-600">
                            {issue.suggestion}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* CSS for highlighting elements */}
      <style jsx global>{`
        .a11y-highlight {
          outline: 3px solid #f59e0b !important;
          outline-offset: 2px !important;
          background-color: rgba(245, 158, 11, 0.1) !important;
        }
      `}</style>
    </>
  );
};

export default AccessibilityChecker;