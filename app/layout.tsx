import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CodeRed - AI-Powered Learner Management',
  description: 'Identify at-risk learners and provide personalized AI-powered nudges to improve engagement and outcomes.',
  keywords: ['education', 'AI', 'learner management', 'risk assessment', 'personalized learning'],
  authors: [{ name: 'CodeRed Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50 antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}