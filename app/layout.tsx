import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Shundor Space - Billing System',
  generator: 'M3S',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
