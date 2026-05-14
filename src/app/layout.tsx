import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Partitura — Création de Personnage',
  description: 'De Foi, de Gloire et de Sang',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
