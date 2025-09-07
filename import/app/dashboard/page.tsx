'use client';

// Force dynamic rendering to avoid useSearchParams issues during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import React from 'react';
import { SuspenseWrapper } from '@/components/layout';
import { DashboardPageContent } from '@/components/dashboard';

const DashboardPage: React.FC = () => {
  return (
    <SuspenseWrapper>
      <DashboardPageContent />
    </SuspenseWrapper>
  );
};

export default DashboardPage;