'use client'

import { useState } from 'react'
import SORTS_DATA from '@/data/sorts.json'

// Données générées depuis le Livret des Voix : ne pas modifier à la main,
// relancer scripts/generer_sorts.py sur ACTIF/livret_des_voix.docx.

const CERCLES = [
  {min:0,max:30,label:'Novice',sorts:3},
  {min:31,max:50,label:'Pratiquant',sorts:6},
  {min:51,max:70,label:'Expert',sorts:9},
  {min:71,max:85,label:'Maître',sorts:12},
  {min:86,max:999,label:'Magistère',sorts:15},
]

// Accès aux catégories selon le palier (Livret des Voix, « Les Cinq Paliers »).
// Les rituels s'ouvrent un par un, dès que la Voix égale leur Difficulté.
const CAT_UNLOCK: Record<string,number> = {
  mineurs:0, utilitaires:31, tactiques:51, signature:71, rituels:0
}
const CAT_LABELS: Record<string,string> = {
  mineurs:'Gestes mineurs', utilitaires:'Utilitaires', tactiques:'Tactiques', signature:'Signature', rituels:'Rituels'
}
const TYPE_LABELS: Record<string,string> = {I:'Instantané',S:'Standard',C:'Concentration',X:'Réaction',R:'Rituel'}
const TYPE_COLORS: Record<string,string> = {
  I:'rgba(34,201,122,.15)',S:'rgba(127,119,221,.15)',C:'rgba(250,199,117,.15)',X:'rgba(74,158,224,.15)',R:'rgba(216,90,48,.15)'
}
const TYPE_TEXT: Record<string,string> = {I:'#22C97A',S:'#7F77DD',C:'#FAC775',X:'#4A9EE0',R:'#FF9068'}

type Sort = {n:string,diff:number|string,pm:number|string,pv?:number|string,type:string,typeTexte?:string,incant?:string,dur:string,effet:string}
type VoixData = {titres:Record<string,string>,sorts:Record<string,Sort[]>}
const SORTS = SORTS_DATA as unknown as Record<string,VoixData>

interface Props {
  voiceId: string
  vUniv: number
  vSpec: number
  esprit: number
}

export default function SortsSection({ voiceId, vUniv, vSpec, esprit }: Props) {
  const [activeCat, setActiveCat] = useState('mineurs')
  const [activeVoix, setActiveVoix] = useState<'univ'|'spec'>('univ')

  const scoreUniv = Math.min(vUniv, esprit)
  const scoreSpec = Math.min(vSpec, esprit)
  const score = activeVoix === 'univ' ? scoreUniv : scoreSpec
  const cercle = CERCLES.find(c => score >= c.min && score <= c.max) || CERCLES[0]
  const vKey = activeVoix === 'univ' ? 'universelle' : voiceId
  const voix = SORTS[vKey] || SORTS.universelle
  const cat = score >= CAT_UNLOCK[activeCat] ? activeCat : 'mineurs'
  const sorts = voix.sorts[cat] || []
  const titre = (c:string) => voix.titres?.[c] ? `${c} — ${voix.titres[c]}` : c

  return (
    <div>
      {/* Sélecteur Voix */}
      <div style={{display:'flex',gap:6,marginBottom:10,flexWrap:'wrap' as const}}>
        <button onClick={() => setActiveVoix('univ')} style={{
          padding:'4px 12px',borderRadius:20,fontSize:11,cursor:'pointer',border:'none',
          background: activeVoix==='univ' ? 'rgba(127,119,221,.3)' : '#221F35',
          color: activeVoix==='univ' ? '#A29BFE' : '#9B96B8',
          fontWeight: activeVoix==='univ' ? 700 : 400,
        }}>
          Voix Universelle (score {scoreUniv} · {CERCLES.find(c=>scoreUniv>=c.min&&scoreUniv<=c.max)?.label})
        </button>
        <button onClick={() => setActiveVoix('spec')} style={{
          padding:'4px 12px',borderRadius:20,fontSize:11,cursor:'pointer',border:'none',
          background: activeVoix==='spec' ? 'rgba(34,201,122,.2)' : '#221F35',
          color: activeVoix==='spec' ? '#22C97A' : '#9B96B8',
          fontWeight: activeVoix==='spec' ? 700 : 400,
        }}>
          Voix spécialisée (score {scoreSpec} · {CERCLES.find(c=>scoreSpec>=c.min&&scoreSpec<=c.max)?.label})
        </button>
      </div>

      {/* Cercle info */}
      <div style={{fontSize:11,color:'#9B96B8',padding:'5px 10px',background:'#221F35',borderRadius:6,marginBottom:8}}>
        Palier : <strong style={{color:'#FAC775'}}>{titre(cercle.label)}</strong> · {cercle.sorts} sorts connus · Score {score}
      </div>

      {/* Catégories */}
      <div style={{display:'flex',gap:5,flexWrap:'wrap' as const,marginBottom:8}}>
        {Object.keys(CAT_UNLOCK).map(c => {
          const unlocked = score >= CAT_UNLOCK[c]
          return (
            <button key={c} onClick={() => unlocked && setActiveCat(c)} style={{
              padding:'3px 10px',borderRadius:20,fontSize:10,cursor:unlocked?'pointer':'not-allowed',
              border:'none',opacity:unlocked?1:0.35,
              background: cat===c ? '#534AB7' : '#221F35',
              color: cat===c ? '#fff' : '#9B96B8',
              fontWeight: cat===c ? 700 : 400,
            }}>
              {CAT_LABELS[c]}
            </button>
          )
        })}
      </div>

      {/* Liste sorts */}
      <div style={{display:'flex',flexDirection:'column' as const,gap:5}}>
        {cat === 'rituels' && (
          <div style={{fontSize:10,color:'#9B96B8',padding:'4px 8px'}}>
            Les rituels s'apprennent par l'étude (maître, traité, lieu d'Empreinte) et ne comptent pas parmi les sorts connus. Chacun s'ouvre dès que la Voix égale sa Difficulté.
          </div>
        )}
        {sorts.map((s: Sort) => {
          const bloque = cat === 'rituels' && Number(s.diff) > score
          return (
          <div key={s.n} style={{background:'#221F35',borderRadius:6,padding:'8px 10px',opacity:bloque?0.45:1}}>
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3,flexWrap:'wrap' as const}}>
              <span style={{fontSize:12,fontWeight:600,color:'#E8E6F0',flex:1}}>{s.n}</span>
              <span style={{fontSize:10,padding:'2px 6px',borderRadius:8,background:TYPE_COLORS[s.type],color:TYPE_TEXT[s.type]}}>{s.typeTexte || TYPE_LABELS[s.type]}</span>
              <span style={{fontSize:10,padding:'2px 6px',borderRadius:8,background:'rgba(127,119,221,.15)',color:'#A29BFE'}}>Diff {s.diff}</span>
              <span style={{fontSize:10,padding:'2px 6px',borderRadius:8,background:'rgba(74,158,224,.15)',color:'#4A9EE0'}}>{s.pm} PM{s.pv?` · ${s.pv} PV`:''}</span>
              <span style={{fontSize:10,padding:'2px 6px',borderRadius:8,background:'rgba(250,199,117,.1)',color:'#FAC775'}}>{s.dur}</span>
              {s.incant && <span style={{fontSize:10,padding:'2px 6px',borderRadius:8,background:'#1A1828',color:'#6B6589'}}>⏱ {s.incant}</span>}
            </div>
            <div style={{fontSize:11,color:'#9B96B8'}}>{s.effet}</div>
            {bloque && <div style={{fontSize:10,color:'#FF9068',marginTop:3}}>Voix {s.diff} requise</div>}
          </div>
          )
        })}
        {sorts.length === 0 && (
          <div style={{fontSize:12,color:'#6B6589',textAlign:'center' as const,padding:'1rem'}}>
            Aucun sort dans cette catégorie.
          </div>
        )}
      </div>

      <div style={{fontSize:10,color:'#6B6589',marginTop:8,padding:'5px 8px',background:'rgba(127,119,221,.05)',borderRadius:6}}>
        ⚠ Sorts attribués par la main de Vaela (Meneur) · 1 seul sort Instantané par tour · 1 seul sort de Concentration maintenu · 1 seul rituel tenu · PM dépensés même en cas d'échec · Seuil = Voix + Esprit − Diff (5–95) · Sort offensif : IA magique = Esprit + Voix − Diff, seuil = 40 + IA magique − ID
      </div>
    </div>
  )
}

