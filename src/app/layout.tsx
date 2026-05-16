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
      <head>
        <script dangerouslySetInnerHTML={{__html: `
          window.__SUPABASE_URL__ = "${process.env.NEXT_PUBLIC_SUPABASE_URL}";
          window.__SUPABASE_ANON_KEY__ = "${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}";
        `}} />
      </head>
      <body>{children}</body>
    </html>
  )
}