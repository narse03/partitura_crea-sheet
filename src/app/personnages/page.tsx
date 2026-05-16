'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function PersonnagesPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    
    // Vérifie la session toutes les 500ms pendant 5 secondes max
    let attempts = 0
    const check = setInterval(async () => {
      attempts++
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        clearInterval(check)
        setUser(session.user)
        setLoading(false)
      } else if (attempts > 10) {
        clearInterval(check)
        window.location.href = '/auth/login'
      }
    }, 500)

    return () => clearInterval(check)
  }, [])

  if (loading) return (
    <div style={{background:'#0F0E17',minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12}}>
      <div style={{color:'#7F77DD',fontSize:24}}>⚔</div>
      <div style={{color:'#9B96B8',fontSize:14}}>Chargement...</div>
    </div>
  )

  return (
    <main style={{background:'#0F0E17',minHeight:'100vh'}}>
      <nav style={{background:'#1A1828',borderBottom:'1px solid #2E2B45',padding:'1rem 1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{fontWeight:700,fontSize:18,background:'linear-gradient(135deg,#FAC775,#7F77DD)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
          PARTITURA
        </span>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:12,color:'#6B6589'}}>{user?.email}</span>
          <button onClick={async () => {
            const supabase = createClient()
            await supabase.auth.signOut()
            window.location.href = '/'
          }} style={{fontSize:12,color:'#6B6589',background:'transparent',border:'1px solid #2E2B45',borderRadius:6,padding:'4px 12px',cursor:'pointer'}}>
            Déconnexion
          </button>
        </div>
      </nav>
      <div style={{maxWidth:900,margin:'0 auto',padding:'2rem 1rem'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem'}}>
          <h1 style={{fontSize:22,fontWeight:700,color:'#E8E6F0'}}>Mes Personnages</h1>
          <Link href="/creation" style={{background:'#534AB7',color:'#fff',padding:'8px 18px',borderRadius:6,fontSize:13,fontWeight:600,textDecoration:'none'}}>
            + Nouveau personnage
          </Link>
        </div>
        <div style={{background:'#1A1828',border:'1px solid #2E2B45',borderRadius:10,padding:'3rem',textAlign:'center'}}>
          <div style={{fontSize:36,marginBottom:12}}>⚔</div>
          <p style={{color:'#9B96B8',marginBottom:16}}>Aucun personnage pour l'instant.</p>
          <Link href="/creation" style={{background:'#534AB7',color:'#fff',padding:'8px 18px',borderRadius:6,fontSize:13,fontWeight:600,textDecoration:'none'}}>
            Créer mon premier personnage
          </Link>
        </div>
      </div>
    </main>
  )
}