import React from 'react';
import { NavBar, Hero, Footer } from '@/components/layout';
import { 
  FeaturesShowcase, 
  TrustIndicators, 
  SocialProof, 
  CallToAction 
} from '@/components/landing';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">
        <Hero />
        <FeaturesShowcase />
        <TrustIndicators />
        <SocialProof />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}