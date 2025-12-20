import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';
import { cn } from '@/lib/utils';
// ✅ CHANGE 1: Import the new wrapper instead of the direct provider
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: 'SynergyHub AI',
  description: 'AI-powered team and project collaboration platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased')}>
        {/* ✅ CHANGE 2: Wrap children with AuthProvider */}
        <AuthProvider>
            {children}
        </AuthProvider>
        
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}