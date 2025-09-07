'use client';

import React, { useEffect, useRef } from 'react';

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ 
  children, 
  className = '' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const xPos = (clientX / innerWidth) * 100;
      const yPos = (clientY / innerHeight) * 100;

      container.style.setProperty('--mouse-x', `${xPos}%`);
      container.style.setProperty('--mouse-y', `${yPos}%`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        '--mouse-x': '50%',
        '--mouse-y': '50%',
      } as React.CSSProperties}
    >
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 -z-10">
        <div 
          className="absolute w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30 transition-all duration-1000 ease-out"
          style={{
            left: 'calc(var(--mouse-x) - 200px)',
            top: 'calc(var(--mouse-y) - 200px)',
            transform: 'translate(-50%, -50%)',
          }}
        />
        <div 
          className="absolute w-64 h-64 bg-accent/20 rounded-full blur-2xl opacity-40 transition-all duration-700 ease-out"
          style={{
            left: 'calc(var(--mouse-x) + 100px)',
            top: 'calc(var(--mouse-y) + 100px)',
            transform: 'translate(-50%, -50%)',
          }}
        />
        <div 
          className="absolute w-80 h-80 bg-primary/10 rounded-full blur-3xl opacity-20 transition-all duration-1200 ease-out"
          style={{
            left: 'calc(var(--mouse-x) - 150px)',
            top: 'calc(var(--mouse-y) + 150px)',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 -z-10 opacity-5">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: 'translate(calc(var(--mouse-x) * 0.02), calc(var(--mouse-y) * 0.02))',
          }}
        />
      </div>

      {children}
    </div>
  );
};
