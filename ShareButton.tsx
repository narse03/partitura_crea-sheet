'use client'

import { useState } from 'react'

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