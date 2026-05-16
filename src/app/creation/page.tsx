'use client'

import { useEffect } from 'react'

export default function CreationPage() {
  useEffect(() => {
    // Redirection temporaire vers le wizard HTML existant
    window.location.href = 'https://partitura-crea-sheet.vercel.app'
  }, [])

  return (
    <div style={{background:'#0F0E17',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{color:'#9B96B8'}}>Chargement du wizard...</div>
    </div>
  )
}