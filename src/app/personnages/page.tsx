'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function PersonnagesPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (!session) {
      window.location.href = '/auth/login'
      return
    }
    setUser(session.user)
    setLoading(false)
  })
}, [])

  if (loading) return (
    <div style={{background:'#0F0E17',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{color:'#9B96B8'}}>Chargement...</div>
    </div>
  )

  return (
    <main className="min-h-screen" style={{background:'#0F0E17'}}>
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between"
           style={{background:'#1A1828'}}>
        <Link href="/" className="font-bold text-lg"
              style={{background:'linear-gradient(135deg,#FAC775,#7F77DD)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
          PARTITURA
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text3">{user?.email}</span>
          <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/' }}
            className="text-xs text-text3 hover:text-red transition-colors px-3 py-1 rounded border border-border">
            Déconnexion
          </button>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text">Mes Personnages</h1>
          <Link href="/creation" className="btn-primary">
            + Nouveau personnage
          </Link>
        </div>
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">⚔</div>
          <p className="text-text2 mb-4">Aucun personnage pour l'instant.</p>
          <Link href="/creation" className="btn-primary inline-block">
            Créer mon premier personnage
          </Link>
        </div>
      </div>
    </main>
  )
}