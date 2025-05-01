import type { Metadata } from 'next';
import './globals.css';
import { Navigation } from './components/Navigation';

export const metadata: Metadata = {
  title: 'PromptPing.de',
  description: 'A smart, daily-updated prompt hub for businesses',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}