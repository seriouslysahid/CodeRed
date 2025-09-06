'use client';

// Force dynamic rendering to avoid useSearchParams issues during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import React from 'react';
import { SuspenseWrapper } from '@/components/layout';
import { LearnersPageContent } from '@/components/learners';

const LearnersPage: React.FC = () => {
  return (
    <SuspenseWrapper>
      <LearnersPageContent />
    </SuspenseWrapper>
  );
};

export default LearnersPage;