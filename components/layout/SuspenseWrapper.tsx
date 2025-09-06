'use client';

import { Suspense, ReactNode } from 'react';
import { Spinner } from '@/components/ui';

interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function SuspenseWrapper({ 
  children, 
  fallback = (
    <div className="flex items-center justify-center p-8">
      <Spinner size="lg" />
    </div>
  )
}: SuspenseWrapperProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}
