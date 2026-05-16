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
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      window.location.replace('/personnages')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      window.location.replace('/personnages')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{background:'#0F0E17'}}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold"
                style={{background:'linear-gradient(135deg,#FAC775,#7F77DD)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
            PARTITURA
          </Link>
          <p className="text-text2 text-sm mt-1">
            {mode === 'login' ? 'Connecte-toi' : 'Crée ton compte'}
          </p>
        </div>
        <div className="card p-6">
          <div className="flex gap-2 mb-6 bg-bg3 rounded-lg p-1">
            {(['login','signup'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all
                  ${mode===m ? 'bg-purple2 text-white' : 'text-text2 hover:text-text'}`}>
                {m === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-text3 uppercase tracking-wider block mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="ton@email.com" required className="w-full" />
            </div>
            <div>
              <label className="text-xs text-text3 uppercase tracking-wider block mb-1">Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required minLength={6} className="w-full" />
            </div>
            {error && <div className="warn-box">{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary py-3 mt-2">
              {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-text3 mt-4">
          <Link href="/creation" className="text-purple hover:text-text2 transition-colors">
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