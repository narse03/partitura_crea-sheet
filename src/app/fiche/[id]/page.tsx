'use client'

import SortsSection from '@/components/fiche/SortsSection'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'

export default function FichePage() {
  const [personnage, setPersonnage] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('personnages')
      .select('*')
      .or(`id.eq.${id},share_token.eq.${id}`)
      .single()
      .then(({ data }) => {
        setPersonnage(data)
        setLoading(false)
      })
  }, [id])

  if (loading) return (
    <div style={{background:'#0F0E17',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{color:'#9B96B8'}}>Chargement...</div>
    </div>
  )

  if (!personnage) return (
    <div style={{background:'#0F0E17',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{color:'#FF9068'}}>Personnage introuvable.</div>
    </div>
  )

  const d = personnage.data
  const STATS = ['Corps','Agilité','Esprit','Volonté','Présence','Perception']

  return (
    <main style={{background:'#0F0E17',minHeight:'100vh',padding:'2rem 1rem'}}>
      <div style={{maxWidth:680,margin:'0 auto'}}>

        <div style={{textAlign:'center',marginBottom:'1.5rem'}}>
          <div style={{fontSize:11,color:'#6B6589',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:4}}>PARTITURA — Fiche de Personnage</div>
          <h1 style={{fontSize:26,fontWeight:700,color:'#E8E6F0'}}>{personnage.nom}</h1>
          <div style={{fontSize:13,color:'#9B96B8',marginTop:4}}>{personnage.race} · {d?.concept || ''}</div>
        </div>

        {/* Ressources */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:12}}>
          {[['PV',d?.pv,'#FF9068'],['PM',d?.pm,'#4A9EE0'],['Initiative',d?`${d.initBase}+1d10`:'?','#7F77DD'],['Renommée',d?.renommee,'#FAC775']].map(([l,v,c])=>(
            <div key={l as string} style={{background:'#1A1828',border:`1px solid ${c}40`,borderRadius:8,padding:'12px',textAlign:'center'}}>
              <div style={{fontSize:20,fontWeight:700,color:c as string}}>{v as any ?? '?'}</div>
              <div style={{fontSize:9,color:'#6B6589',textTransform:'uppercase',letterSpacing:'0.06em',marginTop:2}}>{l as string}</div>
            </div>
          ))}
        </div>

        {/* IA / ID */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
          <div style={{background:'#1A1828',border:'1px solid #2E2B45',borderRadius:8,padding:'10px',textAlign:'center'}}>
            <div style={{fontSize:18,fontWeight:700,color:'#FAC775'}}>{d?.ia ?? '?'}</div>
            <div style={{fontSize:9,color:'#6B6589',textTransform:'uppercase',marginTop:2}}>IA Mêlée</div>
          </div>
          <div style={{background:'#1A1828',border:'1px solid #2E2B45',borderRadius:8,padding:'10px',textAlign:'center'}}>
            <div style={{fontSize:18,fontWeight:700,color:'#22C97A'}}>{d?.id_ ?? '?'}</div>
            <div style={{fontSize:9,color:'#6B6589',textTransform:'uppercase',marginTop:2}}>ID</div>
          </div>
        </div>

        {/* Caractéristiques */}
        <div style={{background:'#1A1828',border:'1px solid #2E2B45',borderRadius:8,padding:'1rem',marginBottom:12}}>
          <div style={{fontSize:9,color:'#6B6589',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:10,fontWeight:700}}>Caractéristiques</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
            {STATS.map(s => (
              <div key={s} style={{textAlign:'center',padding:'8px',background:'#221F35',borderRadius:6}}>
                <div style={{fontSize:9,color:'#6B6589',textTransform:'uppercase'}}>{s}</div>
                <div style={{fontSize:18,fontWeight:700,color:'#E8E6F0'}}>{d?.finalStats?.[s] ?? '?'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Compétences */}
        <div style={{background:'#1A1828',border:'1px solid #2E2B45',borderRadius:8,padding:'1rem',marginBottom:12}}>
          <div style={{fontSize:9,color:'#6B6589',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:8,fontWeight:700}}>Compétences</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
            {d?.major?.map((sk: string) => (
              <span key={sk} style={{fontSize:11,padding:'3px 8px',borderRadius:16,background:'rgba(127,119,221,.2)',color:'#7F77DD',border:'1px solid rgba(127,119,221,.3)'}}>
                {sk} <strong>+{(d?.majorSkills||d?.major||[]).includes(sk)?10:5}</strong>
              </span>
            ))}
            {d?.minor?.map((sk: string) => (
              <span key={sk} style={{fontSize:11,padding:'3px 8px',borderRadius:16,background:'rgba(34,201,122,.12)',color:'#22C97A',border:'1px solid rgba(34,201,122,.2)'}}>
                {sk} <strong>+5</strong>
              </span>
            ))}
          </div>
        </div>

        {/* Voix */}
        <div style={{background:'#1A1828',border:'1px solid #2E2B45',borderRadius:8,padding:'1rem',marginBottom:12}}>
          <div style={{fontSize:9,color:'#6B6589',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:8,fontWeight:700}}>Voix & Magie</div>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            <div style={{padding:'8px 12px',background:'rgba(127,119,221,.1)',borderRadius:6}}>
              <div style={{fontSize:12,fontWeight:600,color:'#E8E6F0'}}>Voix Universelle</div>
              <div style={{fontSize:11,color:'#9B96B8'}}>Score : {d?.vUniv ?? 10}</div>
            </div>
            {d?.voiceName && (
              <div style={{padding:'8px 12px',background:'rgba(34,201,122,.08)',borderRadius:6}}>
                <div style={{fontSize:12,fontWeight:600,color:'#22C97A'}}>{d.voiceName}</div>
                <div style={{fontSize:11,color:'#9B96B8'}}>Score : {d?.vSpec ?? 10}</div>
              </div>
            )}
          </div>
        </div>
{/* Sorts */}
{d?.voice && (
  <div style={{background:'#1A1828',border:'1px solid #2E2B45',borderRadius:8,padding:'1rem',marginBottom:12}}>
    <div style={{fontSize:9,color:'#6B6589',textTransform:'uppercase' as const,letterSpacing:'0.07em',marginBottom:8,fontWeight:700}}>
      Sorts disponibles
    </div>
    <SortsSection voiceId={d.voice?.id} vUniv={d.vUniv||10} vSpec={d.vSpec||10} esprit={d.finalStats?.Esprit||30} />
  </div>
)}
        {/* Équipement */}
        {(d?.weapon || d?.armor) && (
          <div style={{background:'#1A1828',border:'1px solid #2E2B45',borderRadius:8,padding:'1rem',marginBottom:12}}>
            <div style={{fontSize:9,color:'#6B6589',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:8,fontWeight:700}}>Équipement</div>
            <div style={{display:'flex',flexDirection:'column',gap:4,fontSize:12}}>
              {d?.weapon?.n && <div><span style={{color:'#9B96B8'}}>Arme : </span>{d.weapon.n}</div>}
              {d?.armor?.n && <div><span style={{color:'#9B96B8'}}>Armure : </span>{d.armor.n}</div>}
              {d?.shield?.n && d.shield.n !== 'Aucun' && <div><span style={{color:'#9B96B8'}}>Bouclier : </span>{d.shield.n}</div>}
              {d?.inv?.length > 0 && <div><span style={{color:'#9B96B8'}}>Inventaire : </span>{d.inv.map((i:any)=>`${i.n}×${i.qty}`).join(', ')}</div>}
            </div>
          </div>
        )}

        {/* Avantages */}
        {d?.pairs?.length > 0 && (
          <div style={{background:'#1A1828',border:'1px solid #2E2B45',borderRadius:8,padding:'1rem',marginBottom:12}}>
            <div style={{fontSize:9,color:'#6B6589',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:8,fontWeight:700}}>Avantages & Désavantages</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
              {d.pairs.map((p:any,i:number) => (
                <span key={i}>
                  <span style={{fontSize:11,padding:'3px 8px',borderRadius:16,background:'rgba(34,201,122,.12)',color:'#22C97A',border:'1px solid rgba(34,201,122,.2)'}}>{p.adv.n}</span>
                  <span style={{fontSize:11,color:'#6B6589',margin:'0 4px'}}>↓</span>
                  <span style={{fontSize:11,padding:'3px 8px',borderRadius:16,background:'rgba(216,90,48,.1)',color:'#FF9068',border:'1px solid rgba(216,90,48,.2)'}}>{p.dis.n}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Histoire */}
        {d?.bio && (
          <div style={{background:'#1A1828',border:'1px solid #2E2B45',borderRadius:8,padding:'1rem',marginBottom:12}}>
            <div style={{fontSize:9,color:'#6B6589',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:8,fontWeight:700}}>Histoire</div>
            <p style={{fontSize:12,color:'#9B96B8',lineHeight:1.6}}>{d.bio}</p>
          </div>
        )}

        {/* Formules */}
        <div style={{background:'rgba(127,119,221,.06)',border:'1px solid rgba(127,119,221,.15)',borderRadius:8,padding:'10px 14px',fontSize:10,color:'#6B6589',lineHeight:1.6,marginBottom:16}}>
          IA mêlée = Corps+Comp−Fat·5−ArmIA · IA distance = Agi+Tir · ID = (Corps+Agi)÷2+Déf+Bouclier · Seuil combat = 40+IA−ID (5–95) · Seuil sort = Voix+Esprit−Diff
        </div>

        <div style={{display:'flex',gap:8}}>
          <a href="/personnages" style={{flex:1,textAlign:'center',padding:'10px',borderRadius:8,background:'#221F35',color:'#9B96B8',textDecoration:'none',fontSize:13}}>
            ← Mes personnages
          </a>
          <button onClick={() => window.print()} style={{flex:1,padding:'10px',borderRadius:8,background:'rgba(201,168,76,.15)',color:'#FAC775',border:'1px solid rgba(201,168,76,.3)',fontSize:13,cursor:'pointer'}}>
            🖨 Imprimer
          </button>
        </div>

      </div>
    </main>
  )
}