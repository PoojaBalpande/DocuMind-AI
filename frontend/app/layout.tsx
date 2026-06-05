import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ThemeProvider from '@/components/shared/ThemeProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'DocuMind AI — Document Intelligence Platform',
    template: '%s | DocuMind AI',
  },
  description: 'AI-powered document intelligence platform. Upload PDFs, chat with documents, extract insights with cited sources.',
  keywords: ['AI', 'document intelligence', 'PDF chat', 'knowledge base', 'enterprise AI'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background font-[Inter,system-ui,sans-serif] text-on-surface antialiased min-h-screen">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
