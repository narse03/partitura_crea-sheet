import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogoutButton } from '@/components/ui/LogoutButton'
import type { Personnage } from '@/types'

export default async function MJDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Récupère tous les personnages publics (partagés)
  const { data: personnages } = await supabase
    .from('personnages')
    .select('*')
    .eq('is_public', true)
    .order('updated_at', { ascending: false })

  const STATS = ['Corps','Agilité','Esprit','Volonté','Présence','Perception']

  return (
    <main className="min-h-screen" style={{background:'#0F0E17'}}>
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between" style={{background:'#1A1828'}}>
        <div>
          <Link href="/" className="font-bold text-lg"
                style={{background:'linear-gradient(135deg,#FAC775,#7F77DD)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
            PARTITURA
          </Link>
          <span className="text-text3 text-xs ml-3">Dashboard Meneur de Jeu</span>
        </div>
        <div className="flex gap-3 items-center">
          <Link href="/personnages" className="text-xs text-text2 hover:text-purple transition-colors">
            Mes personnages
          </Link>
          <LogoutButton />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-text mb-2">Tableau de bord MJ</h1>
        <p className="text-text2 text-sm mb-6">
          {personnages?.length ?? 0} personnage(s) partagé(s) avec leur lien public.
        </p>

        {(!personnages || personnages.length === 0) ? (
          <div className="card text-center py-12">
            <p className="text-text2">Aucun personnage partagé pour l'instant.</p>
            <p className="text-text3 text-xs mt-2">Les joueurs doivent partager le lien de leur fiche.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-border">
                  <th className="pb-3 text-text3 font-medium text-xs uppercase tracking-wider">Nom</th>
                  <th className="pb-3 text-text3 font-medium text-xs uppercase tracking-wider">Race</th>
                  {STATS.map(s => (
                    <th key={s} className="pb-3 text-text3 font-medium text-xs uppercase tracking-wider">{s.slice(0,3)}</th>
                  ))}
                  <th className="pb-3 text-text3 font-medium text-xs uppercase tracking-wider">PV</th>
                  <th className="pb-3 text-text3 font-medium text-xs uppercase tracking-wider">IA</th>
                  <th className="pb-3 text-text3 font-medium text-xs uppercase tracking-wider">ID</th>
                  <th className="pb-3 text-text3 font-medium text-xs uppercase tracking-wider">Voix</th>
                  <th className="pb-3 text-text3 font-medium text-xs uppercase tracking-wider">Fiche</th>
                </tr>
              </thead>
              <tbody>
                {personnages.map((p: Personnage) => {
                  const d = p.data
                  return (
                    <tr key={p.id} className="border-b border-border hover:bg-bg2 transition-colors">
                      <td className="py-3 font-semibold text-text">{p.nom}</td>
                      <td className="py-3 text-text2">{p.race}</td>
                      {STATS.map(s => (
                        <td key={s} className="py-3 text-text font-mono text-center">
                          {d?.finalStats?.[s as keyof typeof d.finalStats] ?? '—'}
                        </td>
                      ))}
                      <td className="py-3 font-mono text-orange text-center">{d?.pv ?? '—'}</td>
                      <td className="py-3 font-mono text-gold text-center">{d?.ia ?? '—'}</td>
                      <td className="py-3 font-mono text-green text-center">{d?.id_ ?? '—'}</td>
                      <td className="py-3 text-xs text-text2">{d?.voiceName ?? '—'}</td>
                      <td className="py-3">
                        <Link href={`/fiche/${p.share_token}`}
                              className="text-xs text-purple hover:text-text transition-colors">
                          Voir →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
