import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DUSDT Transfer System - Demo USDT',
  description: 'Transfer Demo USDT (DUSDT) tokens between Binance IDs with real-time notifications',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Check for TronLink
              if (typeof window !== 'undefined') {
                window.addEventListener('load', () => {
                  if (window.tronWeb) {
                    console.log('TronLink detected');
                  } else {
                    console.log('TronLink not detected');
                  }
                });
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-usdt-green via-usdt-blue to-purple-800">
          {children}
        </div>
      </body>
    </html>
  )
}