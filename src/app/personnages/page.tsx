import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogoutButton } from '@/components/ui/LogoutButton'
import { ShareButton } from '@/components/ui/ShareButton'
import type { Personnage } from '@/types'

export default async function PersonnagesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: personnages } = await supabase
    .from('personnages')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  return (
    <main className="min-h-screen" style={{background:'#0F0E17'}}>
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between"
           style={{background:'#1A1828'}}>
        <Link href="/" className="font-bold text-lg"
              style={{background:'linear-gradient(135deg,#FAC775,#7F77DD)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
          PARTITURA
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text3">{user.email}</span>
          <Link href="/mj/dashboard" className="text-xs text-text2 hover:text-purple transition-colors">
            Dashboard MJ
          </Link>
          <LogoutButton />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text">Mes Personnages</h1>
          <Link href="/creation" className="btn-primary">
            + Nouveau personnage
          </Link>
        </div>

        {(!personnages || personnages.length === 0) ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-3">⚔</div>
            <p className="text-text2 mb-4">Aucun personnage pour l'instant.</p>
            <Link href="/creation" className="btn-primary inline-block">
              Créer mon premier personnage
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {personnages.map((p: Personnage) => (
              <PersonnageCard key={p.id} personnage={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function PersonnageCard({ personnage: p }: { personnage: Personnage }) {
  const d = p.data
  return (
    <div className="card hover:border-border2 transition-colors group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-bold text-text text-base">{p.nom}</div>
          <div className="text-xs text-text2">{p.race}</div>
        </div>
        <span className="text-xs px-2 py-1 rounded-full"
              style={{background:'rgba(127,119,221,.15)',color:'#7F77DD',border:'1px solid rgba(127,119,221,.25)'}}>
          Ren. {d?.renommee ?? '?'}
        </span>
      </div>

      {/* Stats */}
      {d && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[['PV', d.pv], ['PM', d.pm], ['IA', d.ia]].map(([k, v]) => (
            <div key={k as string} className="text-center p-2 rounded-lg" style={{background:'#221F35'}}>
              <div className="text-xs text-text3">{k}</div>
              <div className="font-bold text-text">{v}</div>
            </div>
          ))}
        </div>
      )}

      {/* Voix */}
      {d?.voiceName && (
        <div className="text-xs text-text3 mb-3">✦ {d.voiceName}</div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-2 border-t border-border">
        <Link href={`/fiche/${p.id}`}
              className="flex-1 text-center text-xs py-1.5 rounded-md text-text2 hover:text-text transition-colors"
              style={{background:'#221F35'}}>
          Voir la fiche
        </Link>
        <Link href={`/creation?edit=${p.id}`}
              className="flex-1 text-center text-xs py-1.5 rounded-md text-text2 hover:text-purple transition-colors"
              style={{background:'#221F35'}}>
          Modifier
        </Link>
        <ShareButton shareToken={p.share_token} />
      </div>
    </div>
  )
}
