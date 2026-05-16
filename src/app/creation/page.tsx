'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CreationPage() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [])

  return (
    <main style={{background:'#0F0E17', minHeight:'100vh', padding:'2rem'}}>
      <div style={{maxWidth:'820px', margin:'0 auto'}}>
        <h1 style={{color:'#FAC775', fontSize:'24px', marginBottom:'1rem'}}>
          Création de personnage
        </h1>
        <p style={{color:'#9B96B8'}}>
          Connecté en tant que : {user?.email || 'non connecté'}
        </p>
        <p style={{color:'#9B96B8', marginTop:'1rem'}}>
          Le wizard arrive ici...
        </p>
      </div>
    </main>
  )
}