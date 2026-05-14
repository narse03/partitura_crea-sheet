'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button onClick={handleLogout}
      className="text-xs text-text3 hover:text-red transition-colors px-3 py-1 rounded border border-border hover:border-red/40">
      Déconnexion
    </button>
  )
}

export function ShareButton({ shareToken }: { shareToken: string }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = `${window.location.origin}/fiche/${shareToken}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={handleShare}
      className="px-3 text-xs py-1.5 rounded-md transition-all"
      style={{
        background: copied ? 'rgba(34,201,122,.15)' : '#221F35',
        color: copied ? '#22C97A' : '#9B96B8',
      }}
      title="Copier le lien de partage MJ">
      {copied ? '✓ Copié !' : '🔗'}
    </button>
  )
}
