'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const params = useSearchParams()
  const redirect = params.get('redirect') || '/personnages'
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (mode === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      if (data.session) {
        localStorage.setItem('partitura-auth', JSON.stringify(data.session))
      }
      window.location.href = redirect
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      if (data.session) {
        localStorage.setItem('partitura-auth', JSON.stringify(data.session))
      }
      window.location.href = '/personnages'
    }
  }

  return (
    <main style={{background:'#0F0E17',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
      <div style={{width:'100%',maxWidth:360}}>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <Link href="/" style={{fontSize:24,fontWeight:700,background:'linear-gradient(135deg,#FAC775,#7F77DD)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',textDecoration:'none'}}>
            PARTITURA
          </Link>
          <p style={{color:'#9B96B8',fontSize:13,marginTop:4}}>
            {mode === 'login' ? 'Connecte-toi' : 'Crée ton compte'}
          </p>
        </div>

        <div style={{background:'#1A1828',border:'1px solid #2E2B45',borderRadius:10,padding:'1.5rem'}}>
          <div style={{display:'flex',gap:6,marginBottom:'1.5rem',background:'#221F35',borderRadius:8,padding:4}}>
            {(['login','signup'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex:1,padding:'8px',borderRadius:6,fontSize:13,fontWeight:600,cursor:'pointer',border:'none',
                background: mode===m ? '#534AB7' : 'transparent',
                color: mode===m ? '#fff' : '#9B96B8',
                transition:'all .15s',
              }}>
                {m === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
            <div>
              <label style={{fontSize:11,color:'#6B6589',display:'block',marginBottom:3,textTransform:'uppercase',letterSpacing:'0.04em'}}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="ton@email.com" required
                style={{background:'#221F35',border:'1px solid #3D3960',borderRadius:6,color:'#E8E6F0',padding:'7px 10px',fontSize:13,width:'100%',outline:'none'}} />
            </div>
            <div>
              <label style={{fontSize:11,color:'#6B6589',display:'block',marginBottom:3,textTransform:'uppercase',letterSpacing:'0.04em'}}>Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required minLength={6}
                style={{background:'#221F35',border:'1px solid #3D3960',borderRadius:6,color:'#E8E6F0',padding:'7px 10px',fontSize:13,width:'100%',outline:'none'}} />
            </div>

            {error && (
              <div style={{fontSize:12,color:'#FF9068',background:'rgba(216,90,48,.1)',border:'1px solid rgba(216,90,48,.2)',borderRadius:6,padding:'7px 10px'}}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              background:'#534AB7',color:'#fff',border:'none',borderRadius:6,
              padding:'12px',fontSize:13,fontWeight:600,cursor:'pointer',
              opacity:loading?0.5:1,marginTop:8,
            }}>
              {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
            </button>
          </form>
        </div>

        <p style={{textAlign:'center',fontSize:12,color:'#6B6589',marginTop:16}}>
          <Link href="/creation" style={{color:'#7F77DD',textDecoration:'none'}}>
            Continuer sans compte →
          </Link>
        </p>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{background:'#0F0E17',minHeight:'100vh'}}></div>}>
      <LoginForm />
    </Suspense>
  )
}