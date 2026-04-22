// frontend/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/hooks/useAuth';
import { SocketProvider } from '@/lib/hooks/useSocket';
import './globals.css';

export const metadata: Metadata = {
  title: 'HCDC-X AI+ | Adaptive Secure HybridCode Platform',
  description:
    'Next-generation intelligent encoding ecosystem with multi-layer hybrid codes, AI-powered scanning, and zero-trust security.',
  keywords: [
    'Hybrid Code',
    'QR Code',
    'Barcode',
    'AI Scanner',
    'Security',
    'Real-time Analytics',
    'HCDC-X',
  ],
  authors: [{ name: 'HCDC-X Team' }],
  creator: 'HCDC-X',
  metadataBase: new URL('https://hcdcx-ai.netlify.app'),
  openGraph: {
    title: 'HCDC-X AI+',
    description: 'Adaptive Secure HybridColor Dynamic Code Platform',
    url: 'https://hcdcx-ai.netlify.app',
    siteName: 'HCDC-X AI+',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HCDC-X AI+ Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HCDC-X AI+',
    description: 'Next-generation hybrid code platform',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} dark`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          <SocketProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                  border: '1px solid hsl(var(--border))',
                },
                success: {
                  iconTheme: {
                    primary: '#00FFFF',
                    secondary: '#000000',
                  },
                },
                error: {
                  iconTheme: {
                    primary: 'hsl(var(--destructive))',
                    secondary: '#000000',
                  },
                },
              }}
            />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
