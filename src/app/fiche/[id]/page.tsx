import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ExportPDFButton } from '@/components/fiche/ExportPDFButton'
import type { Personnage } from '@/types'

export default async function FichePage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Cherche par ID ou par share_token
  const { data: p } = await supabase
    .from('personnages')
    .select('*')
    .or(`id.eq.${params.id},share_token.eq.${params.id}`)
    .single() as { data: Personnage | null }

  if (!p) notFound()

  const d = p.data
  const STATS = ['Corps','Agilité','Esprit','Volonté','Présence','Perception']

  return (
    <main className="min-h-screen py-8 px-4" style={{background:'#0F0E17'}}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-xs text-text3 uppercase tracking-widest mb-1">PARTITURA — Fiche de Personnage</div>
          <h1 className="text-3xl font-bold text-text">{p.nom}</h1>
          <div className="text-text2 mt-1">{p.race} · {d?.concept || ''}</div>
        </div>

        {/* Ressources principales */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { l: 'PV', v: d?.pv, color: '#FF9068' },
            { l: 'PM', v: d?.pm, color: '#4A9EE0' },
            { l: 'Initiative', v: d ? `${d.initBase}+1d10` : '?', color: '#7F77DD' },
            { l: 'Renommée', v: d?.renommee, color: '#FAC775' },
          ].map(box => (
            <div key={box.l} className="card text-center py-4">
              <div className="text-2xl font-bold" style={{color: box.color}}>{box.v ?? '?'}</div>
              <div className="text-[10px] text-text3 uppercase tracking-wider mt-1">{box.l}</div>
            </div>
          ))}
        </div>

        {/* IA / ID */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="card text-center py-3">
            <div className="text-xl font-bold text-gold">{d?.ia ?? '?'}</div>
            <div className="text-[10px] text-text3 uppercase tracking-wider mt-1">IA Mêlée</div>
          </div>
          <div className="card text-center py-3">
            <div className="text-xl font-bold text-green">{d?.id_ ?? '?'}</div>
            <div className="text-[10px] text-text3 uppercase tracking-wider mt-1">ID</div>
          </div>
        </div>

        {/* Caractéristiques */}
        <div className="card mb-4">
          <p className="section-title">Caractéristiques</p>
          <div className="grid grid-cols-3 gap-2">
            {STATS.map(s => (
              <div key={s} className="text-center py-2 rounded-lg" style={{background:'#221F35'}}>
                <div className="text-[10px] text-text3 uppercase">{s}</div>
                <div className="font-bold text-lg text-text">
                  {d?.finalStats?.[s as keyof typeof d.finalStats] ?? '?'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compétences */}
        <div className="card mb-4">
          <p className="section-title">Compétences</p>
          <div className="flex flex-wrap gap-2">
            {d?.majorSkills?.map(sk => (
              <span key={sk} className="text-xs px-2 py-1 rounded-full"
                    style={{background:'rgba(127,119,221,.2)',color:'#7F77DD',border:'1px solid rgba(127,119,221,.3)'}}>
                {sk} <strong>+10</strong>
              </span>
            ))}
            {d?.minorSkills?.map(sk => (
              <span key={sk} className="text-xs px-2 py-1 rounded-full"
                    style={{background:'rgba(34,201,122,.12)',color:'#22C97A',border:'1px solid rgba(34,201,122,.2)'}}>
                {sk} <strong>+5</strong>
              </span>
            ))}
          </div>
        </div>

        {/* Voix */}
        <div className="card mb-4">
          <p className="section-title">Voix & Magie</p>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center p-2 rounded-lg" style={{background:'rgba(127,119,221,.1)'}}>
              <span className="text-sm font-semibold">Voix Universelle</span>
              <span className="text-xs text-text2">Score : {d?.vUniv ?? 10}</span>
            </div>
            {d?.voiceName && (
              <div className="flex justify-between items-center p-2 rounded-lg" style={{background:'rgba(34,201,122,.08)'}}>
                <span className="text-sm font-semibold text-green">{d.voiceName}</span>
                <span className="text-xs text-text2">Score : {d.vSpec ?? 10}</span>
              </div>
            )}
          </div>
        </div>

        {/* Équipement */}
        {(d?.weaponName || d?.armorName) && (
          <div className="card mb-4">
            <p className="section-title">Équipement</p>
            <div className="flex flex-col gap-1 text-sm">
              {d.weaponName && <div><span className="text-text2">Arme :</span> {d.weaponName}</div>}
              {d.armorName && <div><span className="text-text2">Armure :</span> {d.armorName}</div>}
              {d.shieldName && d.shieldName !== 'Aucun' && <div><span className="text-text2">Bouclier :</span> {d.shieldName}</div>}
            </div>
          </div>
        )}

        {/* Avantages */}
        {d?.pairs && d.pairs.length > 0 && (
          <div className="card mb-4">
            <p className="section-title">Avantages & Désavantages</p>
            {d.pairs.map((p, i) => (
              <div key={i} className="flex gap-2 items-start text-xs mb-2">
                <span className="px-2 py-0.5 rounded-full text-green" style={{background:'rgba(34,201,122,.12)',border:'1px solid rgba(34,201,122,.2)'}}>
                  {p.adv.n}
                </span>
                <span className="text-text3">↓</span>
                <span className="px-2 py-0.5 rounded-full text-orange" style={{background:'rgba(216,90,48,.1)',border:'1px solid rgba(216,90,48,.2)'}}>
                  {p.dis.n}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Histoire */}
        {d?.bio && (
          <div className="card mb-6">
            <p className="section-title">Histoire</p>
            <p className="text-sm text-text2 leading-relaxed">{d.bio}</p>
          </div>
        )}

        {/* Export PDF */}
        <ExportPDFButton personnage={p} />

      </div>
    </main>
  )
}
