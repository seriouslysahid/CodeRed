'use client';

import React from 'react';
import { clsx } from 'clsx';

export interface SkipLink {
  href: string;
  label: string;
}

export interface SkipLinksProps {
  links?: SkipLink[];
  className?: string;
}

const defaultLinks: SkipLink[] = [
  { href: '#main-content', label: 'Skip to main content' },
  { href: '#navigation', label: 'Skip to navigation' },
  { href: '#footer', label: 'Skip to footer' },
];

const SkipLinks: React.FC<SkipLinksProps> = ({
  links = defaultLinks,
  className,
}) => {
  const handleSkipClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const target = document.getElementById(targetId);
    
    if (target) {
      // Make target focusable if it isn't already
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }
      
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Remove tabindex after focus to restore natural tab order
      setTimeout(() => {
        if (target.getAttribute('tabindex') === '-1') {
          target.removeAttribute('tabindex');
        }
      }, 100);
    }
  };

  return (
    <div className={clsx('skip-links', className)}>
      {links.map((link, index) => (
        <a
          key={index}
          href={link.href}
          onClick={(e) => handleSkipClick(e, link.href)}
          className={clsx(
            'skip-link',
            'absolute left-4 top-4 z-50 px-4 py-2 bg-blue-600 text-white rounded-md font-medium',
            'transform -translate-y-full opacity-0 pointer-events-none',
            'focus:translate-y-0 focus:opacity-100 focus:pointer-events-auto',
            'transition-all duration-200 ease-in-out',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          )}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
};

export default SkipLinks;