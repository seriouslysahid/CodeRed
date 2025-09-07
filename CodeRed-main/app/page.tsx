import React from 'react';
import { NavBar, Hero, Footer } from '@/components/layout';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      <main className="flex-1">
        <Hero />
      </main>
      <Footer />
    </div>
  );
}