import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Realtify - Professional Image Enhancement for Real Estate',
  description: 'Transform empty spaces into stunning interiors with AI-powered image enhancement. Designed exclusively for real estate professionals to accelerate sales and maximize listing appeal.',
  keywords: 'real estate, AI image enhancement, property photos, realtor tools, listing optimization, virtual staging',
  authors: [{ name: 'Realtify Team' }],
  creator: 'Realtify',
  publisher: 'Realtify',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://realtify.studio'),
  openGraph: {
    title: 'Realtify - Professional Image Enhancement for Real Estate',
    description: 'Transform empty spaces into stunning interiors with AI-powered image enhancement. Designed exclusively for real estate professionals to accelerate sales and maximize listing appeal.',
    url: 'https://realtify.com',
    siteName: 'Realtify',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Realtify - Professional Image Enhancement',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Realtify - Professional Image Enhancement for Real Estate',
    description: 'Transform empty spaces into stunning interiors with AI-powered image enhancement.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}