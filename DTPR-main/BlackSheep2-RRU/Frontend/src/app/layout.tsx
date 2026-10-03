import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#172b54',
};

export const metadata: Metadata = {
  title: 'DTRS System • Dynamic Train Regulation & Compound Delay Engine',
  description: 'DTRS System - Dynamic Train Regulation, Live GPS Tracking & Compound ETA Prediction across operational scenarios and corridor route segmentations.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'DTRS System',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚆</text></svg>" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full bg-slate-900 text-irctc-text antialiased selection:bg-irctc-orange/30 selection:text-irctc-orange touch-manipulation">
        {children}
      </body>
    </html>
  );
}
