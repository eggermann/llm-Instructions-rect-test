import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PromptRadar.de',
  description: 'A smart, daily-updated prompt hub for businesses',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-gray-800 text-white p-4">
          <div className="container mx-auto">
            <h1 className="text-xl font-bold">PromptRadar.de</h1>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}