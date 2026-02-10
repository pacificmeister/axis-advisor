import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AXIS Foils Advisor | Official Comparison Tool',
  description: 'Compare AXIS foil wings, masts, and fuselages. Find the perfect setup for your riding style.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50">{children}</body>
    </html>
  )
}
