import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

export const runtime = 'nodejs';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AESTrak',
  description: 'Purchase order tracking for construction teams.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (typeof process !== 'undefined') {
    // Helps verify the runtime environment in production logs.
    console.log('[RootLayout] runtime', process.env.NEXT_RUNTIME, typeof __dirname);
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background font-sans text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
