'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface KeyboardNavigationContextType {
  isKeyboardUser: boolean;
  setKeyboardUser: (isKeyboard: boolean) => void;
}

const KeyboardNavigationContext = createContext<KeyboardNavigationContextType | null>(null);

export interface KeyboardNavigationProviderProps {
  children: React.ReactNode;
}

export const KeyboardNavigationProvider: React.FC<KeyboardNavigationProviderProps> = ({
  children,
}) => {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);

  useEffect(() => {
    let keyboardThrottleTimeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only consider Tab, Arrow keys, Enter, Space, and Escape as keyboard navigation
      const navigationKeys = ['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' ', 'Escape'];
      
      if (navigationKeys.includes(e.key)) {
        setIsKeyboardUser(true);
        
        // Clear any existing timeout
        clearTimeout(keyboardThrottleTimeout);
        
        // Set a timeout to reset keyboard user status after inactivity
        keyboardThrottleTimeout = setTimeout(() => {
          setIsKeyboardUser(false);
        }, 5000); // 5 seconds of inactivity
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
      clearTimeout(keyboardThrottleTimeout);
    };

    const handlePointerDown = () => {
      setIsKeyboardUser(false);
      clearTimeout(keyboardThrottleTimeout);
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('pointerdown', handlePointerDown);
      clearTimeout(keyboardThrottleTimeout);
    };
  }, []);

  // Add CSS class to body for keyboard users
  useEffect(() => {
    if (isKeyboardUser) {
      document.body.classList.add('keyboard-user');
    } else {
      document.body.classList.remove('keyboard-user');
    }

    return () => {
      document.body.classList.remove('keyboard-user');
    };
  }, [isKeyboardUser]);

  const value = {
    isKeyboardUser,
    setKeyboardUser: setIsKeyboardUser,
  };

  return (
    <KeyboardNavigationContext.Provider value={value}>
      {children}
    </KeyboardNavigationContext.Provider>
  );
};

export function useKeyboardNavigation() {
  const context = useContext(KeyboardNavigationContext);
  if (!context) {
    throw new Error('useKeyboardNavigation must be used within a KeyboardNavigationProvider');
  }
  return context;
}

// CSS styles to add to your global CSS for keyboard focus indicators
export const keyboardNavigationStyles = `
  /* Hide focus indicators by default */
  *:focus {
    outline: none;
  }

  /* Show focus indicators only for keyboard users */
  .keyboard-user *:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  /* Custom focus styles for specific elements */
  .keyboard-user button:focus,
  .keyboard-user a:focus,
  .keyboard-user input:focus,
  .keyboard-user textarea:focus,
  .keyboard-user select:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }

  /* Focus styles for custom components */
  .keyboard-user [role="button"]:focus,
  .keyboard-user [role="menuitem"]:focus,
  .keyboard-user [role="tab"]:focus,
  .keyboard-user [role="option"]:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
    background-color: rgba(59, 130, 246, 0.1);
  }

  /* Skip link styles */
  .skip-link:focus {
    outline: 2px solid #ffffff;
    outline-offset: 2px;
  }
`;

export default KeyboardNavigationProvider;