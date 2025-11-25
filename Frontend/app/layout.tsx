import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // 
});

export const metadata: Metadata = {
  title: 'AI Writer – Multi-format AI Writing Assistant',
  description: 'Generate essays, reports, summaries, explanations, audits, articles, and social posts from a single topic.',
  metadataBase: new URL('https://ai-essay-generator-eight.vercel.app'), // 
  openGraph: {
    title: 'AI Essay Writer - Amulya',
    description: 'AI-powered essay generation tool',
    url: '/',
    siteName: 'AI Essay Writer',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
