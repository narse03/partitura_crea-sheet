'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// ── DONNÉES ──────────────────────────────────────────────────────
const STATS = ['Corps','Agilité','Esprit','Volonté','Présence','Perception']
const STEP_LABELS = ['Peuple','Caractéristiques','Compétences','Avantages','Voix','Équipement','Identité','Fiche']

const RACES = [
  {id:'humain',name:'Humain',ren:5,statAdj:{},humanChoice:true,compBonus:{},
   aff:'Adaptabilité — +5 dans une compétence au choix.',
   don:[{l:'Éveil I',t:'Gagne 5 pts Renommée'},{l:'Éveil II',t:'+10 compétence gratuite'},{l:'Éveil III',t:'Ignore conséquence narrative mineure/scénario'}]},
  {id:'elfe',name:'Elfe',ren:2,statAdj:{Agilité:5,Esprit:5,Perception:5,Corps:-5,Présence:-5},compBonus:{},
   aff:'Harmonie Naturelle — Aucun malus en environnements naturels.',
   don:[{l:'Éveil I',t:'Relance Perception 1×/jour'},{l:'Éveil II',t:'+5 temporaire à une Voix'},{l:'Éveil III',t:'Ignore un échec critique magique/scénario'}]},
  {id:'nain',name:'Nain',ren:3,statAdj:{Corps:5,Volonté:5,Agilité:-5,Présence:-5},compBonus:{Endurance:5},
   aff:'Ossature Dense — −1 Fatigue physique par scène.',
   don:[{l:'Éveil I',t:'Ignore 2 premiers pts Fatigue'},{l:'Éveil II',t:'Réduction armure +2'},{l:'Éveil III',t:'Immunité à la peur'}]},
  {id:'saurien',name:'Saurien',ren:3,statAdj:{Corps:5,Perception:5,Esprit:-5,Présence:-5},compBonus:{'Survie physique':5},
   aff:'Sang Ancien — Résistance chaleur et toxines.',
   don:[{l:'Éveil I',t:'+5 IA 1er tour'},{l:'Éveil II',t:'Immunité au poison'},{l:'Éveil III',t:'Récup. 10 PV après mise à terre ennemi'}]},
  {id:'manst',name:'Manst',ren:3,statAdj:{Corps:5,Agilité:5,Volonté:5,Présence:-5,Esprit:-5},compBonus:{},
   aff:'Colosse — Manie arme à 2 mains avec une seule.',
   don:[{l:'Éveil I',t:'Impact +2 dégâts'},{l:'Éveil II',t:'Corps +5'},{l:'Éveil III',t:'Charge Percutante 2×/scénario'}]},
  {id:'lumeris',name:'Luméris',ren:2,statAdj:{Esprit:5,Volonté:5,Perception:3,Corps:-5,Présence:-5},compBonus:{},
   aff:'Peau Chromatique — −10 Tromperie, +5 coordination alliés.',
   don:[{l:'Éveil I',t:'Résonance des Lieux 1×/scénario'},{l:'Éveil II',t:'Résonance étendue'},{l:'Éveil III',t:'Méditation +5 Esprit & Perception'}]},
  {id:'aelos',name:'Aélos',ren:3,statAdj:{Agilité:5,Perception:5,Corps:-5,Volonté:-5},compBonus:{'Maniement Armes':5},
   aff:'Souvenir des Ailes — Vol (3 PV/tour). Ignore dégâts de chute.',
   don:[{l:'Éveil I',t:'+5 Perception extérieur'},{l:'Éveil II',t:'Plus de malus décollage'},{l:'Éveil III',t:'Plus aucun malus en vol'}]},
  {id:'felcan',name:'Felcan',ren:4,statAdj:{Agilité:5,Perception:5,Corps:-5,Présence:-5},compBonus:{},felcanVoix:true,
   aff:'Vision Nocturne — Aucun malus en faible lumière.',
   don:[{l:'Éveil I',t:'+1 pt Voix/session'},{l:'Éveil II',t:'+5 Perception'},{l:'Éveil III',t:'Voix supplémentaire'}]},
  {id:'elfe_noir',name:'Elfe Noir',ren:2,statAdj:{Esprit:5,Agilité:5,Présence:-5,Volonté:-5},compBonus:{Discrétion:5},
   aff:"Vision d'Ombre — Aucun malus en obscurité.",
   don:[{l:'Éveil I',t:'Sort discret 1×/scène'},{l:'Éveil II',t:'Invisibilité 2 tours'},{l:'Éveil III',t:'25% résistance magie'}]},
  {id:'morf',name:'Morf',ren:2,statAdj:{Présence:5,Perception:5,Volonté:-5},compBonus:{Déguisement:5},
   aff:'Morphologie Souple — +5 Déguisement permanent.',
   don:[{l:'Éveil I',t:"Change d'apparence 1×/scénario"},{l:'Éveil II',t:'Copie race quelconque'},{l:'Éveil III',t:"Ignore pertes Esprit metamorphose"}]},
  {id:'dragad',name:'Dragad',ren:2,statAdj:{Corps:5,Volonté:5,Présence:-5},compBonus:{Intimidation:5},
   aff:'Don des Dragons — Souffle 1d10 (cône 3m).',
   don:[{l:'Éveil I',t:'−5 IA ennemis 1er tour'},{l:'Éveil II',t:'+1 réduction armure naturelle'},{l:'Éveil III',t:'Immunité intimidation'}]},
] as any[]

const SKILLS: Record<string,string[]> = {
  Corps:['Athlétisme','Force brute','Endurance','Résistance physique','Survie physique','Natation','Combat à mains nues','Maniement armes lourdes'],
  Agilité:['Esquive','Parade','Discrétion','Dextérité','Acrobatie','Tir','Maniement Armes','Initiative'],
  Esprit:['Connaissance des mondes','Histoire','Arcanes','Investigation','Artisanat','Médecine'],
  Volonté:['Sang-froid','Détermination','Concentration','Discipline mentale','Résilience mentale','Méditation','Leadership'],
  Présence:['Persuasion','Diplomatie','Tromperie','Représentation','Séduction','Commandement','Marchandage','Intimidation','Réseau','Étiquette','Déguisement'],
  Perception:['Observation','Écoute','Intuition','Pistage','Recherche','Orientation'],
}

const VOICES = [
  {id:'universelle',name:'Voix Universelle',tags:['Utilitaire','Soutien']},
  {id:'armes',name:'Voix des Armes',tags:['Combat','Puissance']},
  {id:'sauvage',name:'Voix Sauvage',tags:['Combat','Nature']},
  {id:'dieux',name:'Voix des Dieux',tags:['Soin','Divin']},
  {id:'ombres',name:'Voix des Ombres',tags:['Infiltration','Secret']},
  {id:'erudits',name:'Voix des Érudits',tags:['Connaissance','Analyse']},
  {id:'creation',name:'Voix de la Création',tags:['Artisanat','Artefacts']},
] as any[]

const CERCLES = [
  {min:0,max:30,label:'Novice',sorts:3,ren:0},
  {min:31,max:50,label:'Pratiquant',sorts:6,ren:2},
  {min:51,max:70,label:'Expert',sorts:9,ren:3},
  {min:71,max:85,label:'Maître',sorts:12,ren:5},
  {min:86,max:999,label:'Magistère',sorts:15,ren:8},
] as any[]

// ── STATE INITIAL ────────────────────────────────────────────────
const initState = () => ({
  step: 1,
  race: null as any,
  hPicks: [] as string[],
  base: {Corps:20,Agilité:20,Esprit:20,Volonté:20,Présence:20,Perception:20} as Record<string,number>,
  major: [] as string[],
  minor: [] as string[],
  pairs: [] as any[],
  voice: null as any,
  vUniv: 10,
  vSpec: 10,
  weapon: null as any,
  armor: {n:'Sans armure',red:0,iaM:0,agiM:0},
  shield: {n:'Aucun',id:0},
  inv: [] as {n:string,qty:number}[],
  bourse: {SO:5,CA:0,DC:0},
  nom:'', concept:'', origine:'', intention:'', faction:'', relations:'', bio:'',
})

// ── HELPERS ──────────────────────────────────────────────────────
function getFinal(base: Record<string,number>, race: any, hPicks: string[], s: string) {
  if (!race) return base[s]
  let b = (race.statAdj||{})[s]||0
  if (race.humanChoice && hPicks.includes(s)) b += 5
  return Math.min(60, base[s] + b)
}
function getRaceBonus(race: any, hPicks: string[], s: string) {
  if (!race) return 0
  let b = (race.statAdj||{})[s]||0
  if (race.humanChoice && hPicks.includes(s)) b += 5
  return b
}
function getCercle(score: number) {
  return CERCLES.find((c:any) => score >= c.min && score <= c.max) || CERCLES[0]
}

// ── COMPOSANT PRINCIPAL ──────────────────────────────────────────
export default function CreationPage() {
  const [user, setUser] = useState<any>(null)
  const [st, setSt] = useState(initState())
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUser(session.user)
    })
  }, [])

  const upd = (patch: Partial<typeof st>) => setSt(s => ({...s, ...patch}))
  const corps = getFinal(st.base, st.race, st.hPicks, 'Corps')
  const agi = getFinal(st.base, st.race, st.hPicks, 'Agilité')
  const vol = getFinal(st.base, st.race, st.hPicks, 'Volonté')
  const esp = getFinal(st.base, st.race, st.hPicks, 'Esprit')
  const per = getFinal(st.base, st.race, st.hPicks, 'Perception')
  const pv = corps + Math.floor(vol/2)
  const pm = esp + vol
  const initBase = Math.floor((agi+per)/2)
  const uEff = Math.min(st.vUniv, esp)
  const sEff = Math.min(st.vSpec, esp)
  const cu = getCercle(uEff)
  const cs = st.voice ? getCercle(sEff) : CERCLES[0]
  const renTotal = (st.race?.ren||0) + cu.ren + cs.ren

  // ── SAUVEGARDER ────────────────────────────────────────────────
  async function savePersonnage() {
    if (!user) { window.location.href = '/auth/login'; return }
    setSaving(true)
    const data = {
      ...st,
      finalStats: Object.fromEntries(STATS.map(s => [s, getFinal(st.base, st.race, st.hPicks, s)])),
      pv, pm, initBase, renommee: renTotal,
      ia: corps, id_: Math.floor((corps+agi)/2),
      voiceName: st.voice?.name || '',
    }
    const { error } = await supabase.from('personnages').insert({
      user_id: user.id,
      nom: st.nom || 'Personnage sans nom',
      race: st.race?.name || '',
      data,
      is_public: false,
    })
    setSaving(false)
    if (!error) window.location.href = '/personnages'
    else alert('Erreur lors de la sauvegarde : ' + error.message)
  }

  // ── STYLES ───────────────────────────────────────────────────
  const S = {
    wrap: {background:'#0F0E17',minHeight:'100vh',padding:'1.5rem 1rem'},
    card: {background:'#1A1828',border:'1px solid #2E2B45',borderRadius:'10px',padding:'1rem 1.2rem',marginBottom:'0.85rem'},
    title: {fontSize:'19px',fontWeight:600,color:'#E8E6F0',marginBottom:'0.25rem'},
    sub: {fontSize:'13px',color:'#9B96B8',marginBottom:'1.1rem',lineHeight:1.5},
    btn: {padding:'7px 18px',border:'none',borderRadius:'6px',fontSize:'12px',fontWeight:600,cursor:'pointer'},
    btnP: {background:'#534AB7',color:'#fff'},
    btnS: {background:'transparent',color:'#9B96B8',border:'1px solid #3D3960'},
    input: {background:'#221F35',border:'1px solid #3D3960',borderRadius:'6px',color:'#E8E6F0',padding:'6px 9px',fontSize:'12px',width:'100%',outline:'none'},
    label: {fontSize:'10px',color:'#6B6589',display:'block',marginBottom:'2px',textTransform:'uppercase' as const,letterSpacing:'0.04em'},
    nav: {display:'flex',gap:'8px',justifyContent:'space-between',marginTop:'1.1rem'},
    warn: {fontSize:'11px',color:'#FF9068',background:'rgba(216,90,48,.1)',border:'1px solid rgba(216,90,48,.2)',borderRadius:'6px',padding:'6px 10px',marginBottom:'0.5rem'},
    info: {fontSize:'11px',color:'#9B96B8',background:'rgba(127,119,221,.1)',border:'1px solid rgba(127,119,221,.2)',borderRadius:'6px',padding:'6px 10px',marginBottom:'0.65rem'},
  }

  // ── STEPS INDICATOR ──────────────────────────────────────────
  const Steps = () => (
    <div style={{display:'flex',alignItems:'center',gap:0,marginBottom:'1.5rem',overflowX:'auto',paddingBottom:'4px'}}>
      {STEP_LABELS.map((lbl,i) => {
        const n = i+1
        return (
          <div key={n} style={{display:'flex',alignItems:'center',flexShrink:0}}>
            <div style={{
              width:26,height:26,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:11,fontWeight:700,flexShrink:0,
              background: n===st.step?'#534AB7':n<st.step?'rgba(34,201,122,.2)':'transparent',
              border: n===st.step?'2px solid #7F77DD':n<st.step?'2px solid #22C97A':'2px solid #3D3960',
              color: n===st.step?'#fff':n<st.step?'#22C97A':'#6B6589',
            }}>{n < st.step ? '✓' : n}</div>
            {i < STEP_LABELS.length-1 && <div style={{width:16,height:2,background:'#2E2B45',flexShrink:0}}/>}
          </div>
        )
      })}
    </div>
  )

  // ══════════════════════════════════════════════════════════════
  // STEP 1 — RACE
  // ══════════════════════════════════════════════════════════════
  const Step1 = () => (
    <div>
      <h2 style={S.title}>1. Choisir votre peuple</h2>
      <p style={S.sub}>La race oriente votre personnage. Les ajustements s'appliquent après les 230 points.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:'7px',marginBottom:'0.85rem'}}>
        {RACES.map((r:any) => {
          const pos = Object.entries(r.statAdj||{}).filter(([,v]:any)=>v>0).map(([k,v]:any)=>`+${v} ${k}`).join(', ')
          const neg = Object.entries(r.statAdj||{}).filter(([,v]:any)=>v<0).map(([k,v]:any)=>`${v} ${k}`).join(', ')
          const sel = st.race?.id === r.id
          return (
            <div key={r.id} onClick={() => upd({race:r, hPicks:[]})}
              style={{background:sel?'rgba(127,119,221,.1)':'#221F35',border:sel?'2px solid #7F77DD':'1px solid #2E2B45',borderRadius:'6px',padding:'0.65rem 0.8rem',cursor:'pointer',position:'relative'}}>
              {sel && <span style={{position:'absolute',top:5,right:7,fontSize:11,color:'#7F77DD',fontWeight:700}}>✓</span>}
              <div style={{fontSize:12,fontWeight:600,color:'#E8E6F0',marginBottom:3}}>{r.name}</div>
              {pos && <div style={{fontSize:9,color:'#22C97A'}}>{pos}</div>}
              {neg && <div style={{fontSize:9,color:'#FF9068'}}>{neg}</div>}
              {r.felcanVoix && <div style={{fontSize:9,color:'#7F77DD'}}>+5 Voix</div>}
              {r.humanChoice && <div style={{fontSize:9,color:'#7F77DD'}}>+5×2 stats</div>}
            </div>
          )
        })}
      </div>

      {st.race && (
        <div style={{...S.card,background:'rgba(127,119,221,.08)',border:'1px solid rgba(127,119,221,.3)'}}>
          <div style={{fontSize:15,fontWeight:700,color:'#E8E6F0',marginBottom:4}}>{st.race.name}</div>
          <div style={{fontSize:12,color:'#9B96B8',marginBottom:8,fontStyle:'italic'}}>{st.race.aff}</div>
          {st.race.don.map((d:any) => (
            <div key={d.l} style={{background:'#221F35',borderLeft:'3px solid #7F77DD',borderRadius:'0 6px 6px 0',padding:'5px 9px',marginBottom:4}}>
              <div style={{fontSize:9,color:'#7F77DD',fontWeight:700,textTransform:'uppercase'}}>{d.l}</div>
              <div style={{fontSize:12,color:'#E8E6F0'}}>{d.t}</div>
            </div>
          ))}
        </div>
      )}

      {st.race?.humanChoice && (
        <div style={S.card}>
          <p style={{...S.label,marginBottom:'0.5rem'}}>Choisissez 2 caractéristiques (+5 chacune)</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'7px'}}>
            {STATS.map(s => {
              const i = st.hPicks.indexOf(s)
              return (
                <div key={s} onClick={() => {
                  const picks = [...st.hPicks]
                  const idx = picks.indexOf(s)
                  if (idx >= 0) picks.splice(idx,1)
                  else if (picks.length < 2) picks.push(s)
                  upd({hPicks:picks})
                }} style={{
                  background: i===0?'rgba(127,119,221,.2)':i===1?'rgba(34,201,122,.15)':'#221F35',
                  border: i>=0?`1px solid ${i===0?'#7F77DD':'#22C97A'}`:'1px solid #3D3960',
                  borderRadius:'6px',padding:'7px 10px',cursor:'pointer',fontSize:12,
                  color: i===0?'#7F77DD':i===1?'#22C97A':'#9B96B8',fontWeight:i>=0?600:400,textAlign:'center' as const,
                }}>{s}</div>
              )
            })}
          </div>
          <p style={{fontSize:11,color:st.hPicks.length===2?'#22C97A':'#9B96B8',marginTop:'0.4rem'}}>
            {st.hPicks.length===0?'Sélectionnez 2 caractéristiques':st.hPicks.length===1?`${st.hPicks[0]} ✓ — choisissez la 2e`:`+5 ${st.hPicks[0]} et +5 ${st.hPicks[1]} ✓`}
          </p>
        </div>
      )}

      <div style={S.nav}>
        <div/>
        <button style={{...S.btn,...S.btnP,opacity:!st.race||(st.race.humanChoice&&st.hPicks.length<2)?0.35:1}}
          disabled={!st.race||(st.race.humanChoice&&st.hPicks.length<2)}
          onClick={() => upd({step:2})}>Suivant →</button>
      </div>
    </div>
  )

  // ══════════════════════════════════════════════════════════════
  // STEP 2 — STATS
  // ══════════════════════════════════════════════════════════════
  const Step2 = () => {
    const used = Object.values(st.base).reduce((a,b)=>a+b,0) - 120
    const left = 110 - used
    return (
      <div>
        <h2 style={S.title}>2. Caractéristiques</h2>
        <p style={S.sub}>230 points au total. Base 20 par stat. Maximum 60 avant ajustements raciaux.</p>
        <div style={{background:'#221F35',border:'1px solid #3D3960',borderRadius:'10px',padding:'0.65rem 0.9rem',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.65rem'}}>
          <div style={{fontSize:11,color:'#9B96B8'}}>Points restants</div>
          <div style={{fontSize:26,fontWeight:700,color:left===0?'#22C97A':left<0?'#D85A30':'#FF9068'}}>{left}</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'7px',marginBottom:'0.65rem'}}>
          {STATS.map(s => {
            const base = st.base[s]
            const bonus = getRaceBonus(st.race, st.hPicks, s)
            const final = Math.min(60, base+bonus)
            return (
              <div key={s} style={{background:'#221F35',border:'1px solid #2E2B45',borderRadius:'6px',padding:'0.65rem'}}>
                <div style={{fontSize:10,color:'#6B6589',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:3}}>{s}</div>
                <div style={{display:'flex',alignItems:'center',gap:5,justifyContent:'center'}}>
                  <button onClick={() => {
                    const nv = base-5
                    if (nv < 20) return
                    upd({base:{...st.base,[s]:nv}})
                  }} style={{width:24,height:24,borderRadius:5,border:'1px solid #3D3960',background:'transparent',color:'#E8E6F0',fontSize:15,cursor:'pointer'}}>−</button>
                  <div style={{fontSize:19,fontWeight:700,color:'#fff',minWidth:30,textAlign:'center' as const}}>{base}</div>
                  <button onClick={() => {
                    const nv = base+5
                    if (nv > 60) return
                    const newUsed = used+5
                    if (newUsed > 110) return
                    upd({base:{...st.base,[s]:nv}})
                  }} style={{width:24,height:24,borderRadius:5,border:'1px solid #3D3960',background:'transparent',color:'#E8E6F0',fontSize:15,cursor:'pointer'}}>+</button>
                </div>
                <div style={{fontSize:10,textAlign:'center' as const,marginTop:2}}>
                  <span style={{color:'#fff',fontWeight:600}}>{final}</span>
                  {bonus!==0 && <span style={{color:bonus>0?'#22C97A':'#FF9068',fontSize:9,marginLeft:3}}>{bonus>0?'+':''}{bonus}</span>}
                </div>
              </div>
            )
          })}
        </div>
        <div style={{display:'flex',gap:7,flexWrap:'wrap' as const,marginBottom:'0.65rem'}}>
          {[['PV',pv,'#FF9068'],['PM',pm,'#4A9EE0'],['Initiative',`${initBase}+1d10`,'#7F77DD'],['Ren. race',st.race?.ren||0,'#FAC775']].map(([l,v,c])=>(
            <div key={l as string} style={{background:'#221F35',border:'1px solid #3D3960',borderRadius:'6px',padding:'0.55rem 0.85rem',textAlign:'center' as const,flex:1,minWidth:80}}>
              <div style={{fontSize:20,fontWeight:700,color:c as string}}>{v as any}</div>
              <div style={{fontSize:9,color:'#6B6589',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginTop:1}}>{l as string}</div>
            </div>
          ))}
        </div>
        <div style={S.nav}>
          <button style={{...S.btn,...S.btnS}} onClick={() => upd({step:1})}>← Retour</button>
          <button style={{...S.btn,...S.btnP,opacity:left!==0?0.35:1}} disabled={left!==0} onClick={() => upd({step:3})}>Suivant →</button>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════
  // STEP 3 — COMPÉTENCES
  // ══════════════════════════════════════════════════════════════
  const Step3 = () => {
    const ml = 3 - st.major.length
    const sl = 5 - st.minor.length
    const warns: string[] = []
    return (
      <div>
        <h2 style={S.title}>3. Compétences</h2>
        <p style={S.sub}>3 majeures (+10) · 5 secondaires (+5) · Clic 1=maj · Clic 2=sec · Clic 3=retirer</p>
        <div style={{...S.info,display:'flex',gap:14,flexWrap:'wrap' as const}}>
          <span>Majeures : <strong>{3-ml}/3</strong></span>
          <span>Secondaires : <strong>{5-sl}/5</strong></span>
        </div>
        {Object.entries(SKILLS).map(([stat,skills]) => {
          const cap = getFinal(st.base, st.race, st.hPicks, stat)
          return (
            <div key={stat} style={{background:'#221F35',border:'1px solid #2E2B45',borderRadius:'6px',padding:'0.7rem 0.9rem',marginBottom:'0.55rem'}}>
              <div style={{fontSize:10,fontWeight:700,color:'#6B6589',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:'0.4rem'}}>{stat} — max : {cap}</div>
              <div style={{display:'flex',flexWrap:'wrap' as const,gap:5}}>
                {skills.map(sk => {
                  const isMaj = st.major.includes(sk)
                  const isMin = st.minor.includes(sk)
                  const rb = st.race?.compBonus?.[sk]||0
                  const val = (isMaj?10:isMin?5:0)+rb
                  const over = val > cap
                  if (over && (isMaj||isMin)) warns.push(`${sk} dépasse ${cap}`)
                  return (
                    <span key={sk} onClick={() => {
                      if (isMaj) { upd({major:st.major.filter(s=>s!==sk), minor:st.minor.length<5?[...st.minor,sk]:st.minor}) }
                      else if (isMin) { upd({minor:st.minor.filter(s=>s!==sk)}) }
                      else if (st.major.length<3) { upd({major:[...st.major,sk]}) }
                      else if (st.minor.length<5) { upd({minor:[...st.minor,sk]}) }
                    }} style={{
                      fontSize:11,padding:'3px 9px',borderRadius:18,cursor:'pointer',
                      background: isMaj?'rgba(127,119,221,.2)':isMin?'rgba(34,201,122,.15)':'#1A1828',
                      border: isMaj?'1px solid #7F77DD':isMin?'1px solid #22C97A':over?'1px solid #D85A30':'1px solid #3D3960',
                      color: isMaj?'#7F77DD':isMin?'#22C97A':over?'#FF9068':'#9B96B8',
                      fontWeight: (isMaj||isMin)?600:400,
                      outline: rb>0?'2px solid #FAC775':'none',outlineOffset:1,
                    }}>{sk}{isMaj?' +10':isMin?' +5':''}{rb>0?` (+${rb}★)`:''}</span>
                  )
                })}
              </div>
            </div>
          )
        })}
        {warns.length > 0 && warns.map(w => <div key={w} style={S.warn}>⚠ {w}</div>)}
        <div style={S.nav}>
          <button style={{...S.btn,...S.btnS}} onClick={() => upd({step:2})}>← Retour</button>
          <button style={{...S.btn,...S.btnP,opacity:(ml!==0||sl!==0||warns.length>0)?0.35:1}}
            disabled={ml!==0||sl!==0||warns.length>0} onClick={() => upd({step:4})}>Suivant →</button>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════
  // STEP 4 — AVANTAGES
  // ══════════════════════════════════════════════════════════════
  const ADV_DATA: Record<string,any> = {
    l:{label:'Léger',avantages:[
      {n:'Talent Mineur',e:'Une compétence +5 permanent'},{n:'Bonne Constitution',e:'+5 PV'},
      {n:'Réflexes Vifs',e:'+5 Initiative'},{n:'Regard Perçant',e:'+5 Perception'},
      {n:'Endurant',e:'Réduit Fatigue 1×/scène'},{n:'Apprentissage Rapide',e:'+5 compétence intellectuelle'},
      {n:'Sociable',e:'+5 Présence'},{n:'Discipline',e:'+5 Volonté contre peur'},
      {n:'Artisan Habile',e:'+5 Artisanat'},{n:'Chance Mineure',e:'1 relance/scénario'},
      {n:'Ambidextrie',e:'Ignore malus main faible'},{n:'Force Remarquable',e:'+5 Corps effectif'},
      {n:'Agile Confirmé',e:'+5 IA armes légères'},{n:'Tireur Précis',e:'+5 IA en tir'},
    ],desavantages:[
      {n:'Blessure Ancienne',d:'−5 IA sous Fatigue'},{n:'Cicatrice Visible',d:'−5 Présence noble'},
      {n:'Mauvaise Réputation',d:'−5 interactions sociales'},{n:'Main Faible',d:'−5 IA arme secondaire'},
      {n:'Impulsif',d:'−5 ID premier tour'},{n:'Vision Faible',d:'−5 Perception distance'},
      {n:'Sommeil Agité',d:'−5 Initiative'},{n:'Sensibilité au froid',d:'−5 Corps froid'},
      {n:'Sensibilité chaleur',d:'−5 Corps chaud'},{n:'Superstitieux',d:'−5 Volonté surnaturel'},
      {n:'Tremblement',d:'−5 Tir longue distance'},{n:'Méfiance',d:'−5 diplomatie'},
      {n:'Cicatrice douloureuse',d:'−5 IA temps humide'},{n:'Problème autorité',d:'−5 figures autorité'},
      {n:'Colérique',d:'−5 ID si provoqué'},{n:'Mémoire troublée',d:'Perte info'},
      {n:'Mauvais pied',d:'−5 Initiative permanent'},{n:'Mauvaise posture',d:'−5 Parade'},
      {n:'Manque confiance',d:'−5 1ère action combat'},{n:'Regard fuyant',d:'−5 Présence'},
    ]},
    i:{label:'Important',avantages:[
      {n:'Mage Stable',e:'Ignore malus magique/scène'},{n:'Sang-Froid',e:'Ignore −5 IA/ID sous 50% PV'},
      {n:'Autorité Naturelle',e:'+10 Intimidation'},{n:'Résistance Mentale',e:'+10 vs manipulation'},
      {n:'Voyageur',e:'Ignore malus environnement 1×/scène'},{n:'Réputation Locale',e:'+5 Renommée'},
      {n:'Robustesse',e:'+10 PV permanents'},{n:"Maîtrise d'Arme",e:'+10 IA arme précise'},
      {n:'Mage Talentueux',e:'+10 compétence Voix'},{n:'Esprit Acéré',e:'+5 Esprit permanent'},
      {n:'Présence Marquante',e:'+5 Présence permanent'},{n:'Résistance Magique',e:'−5 dégâts magiques'},
      {n:'Guerrier Né',e:'Ignore 1 Fatigue/combat'},{n:'Stratège',e:'+5 Initiative groupe'},
    ],desavantages:[
      {n:'Phobie',d:'Test Volonté ou −10'},{n:'Santé Fragile',d:'−5 PV permanents'},
      {n:'Peur Magie',d:'−5 jets Voix'},{n:'Endurance Limitée',d:'+1 Fatigue/combat'},
      {n:'Dette',d:'Pression narrative'},{n:'Ennemi mineur',d:'PNJ hostile récurrent'},
      {n:'Peur hauteurs',d:'−10 chutes/vertige'},{n:'Obsession',d:'Perte action si distraction'},
      {n:'Fragilité mentale',d:'+1 Fatigue mentale'},{n:'Peur du sang',d:'−5 IA sous 50% PV'},
      {n:'Claustrophobie',d:'−10 espace clos'},{n:'Honneur rigide',d:'Obligation narrative'},
      {n:'Marqué magie',d:'Détectable par mages'},{n:'Aura inquiétante',d:'−10 interactions'},
      {n:'Sensibilité magique',d:'+1 Fatigue surcharge'},{n:'Blessure mal soignée',d:'−5 Corps permanent'},
      {n:'Bruyant',d:'−10 infiltration'},{n:'Odeur distinctive',d:'−5 furtivité'},
      {n:'Ancien rival',d:'PNJ antagoniste'},{n:'Articulation fragile',d:'+1 Fatigue physique'},
    ]},
    e:{label:'Extraordinaire',avantages:[
      {n:'Sang Noble',e:'+10 interaction officielle'},{n:'Réputation Étendue',e:'+10 Renommée'},
      {n:'Aura Impressionnante',e:'+10 IA premier tour'},{n:"Maître d'Arme",e:'+15 IA arme'},
      {n:'Canalisation Pure',e:'Ignore surcharge 1×/scénario'},{n:'Volonté Inflexible',e:'+15 vs peur/contrôle'},
      {n:'Corps Surentraîné',e:'+10 Corps permanent'},{n:'Mage Inspiré',e:'+10 PM permanents'},
      {n:'Héritage Puissant',e:'Accès artefacts'},{n:'Héros Reconnu',e:'+15 Renommée'},
      {n:'Talent Rare',e:'+15 compétence'},{n:'Destin Remarquable',e:'1 réussite auto/scénario'},
    ],desavantages:[
      {n:'Corps Fragile',d:'−10 PV permanents'},{n:'Peau sensible',d:'−1 réduction armure'},
      {n:'Vision nocturne faible',d:'−5 obscurité'},{n:'Fierté excessive',d:'Obligation narrative'},
      {n:'Faiblesse psychique',d:'−5 Volonté permanent'},{n:'Lenteur',d:'−5 IA toutes armes'},
      {n:'Déséquilibre',d:'−5 ID permanent'},{n:'Cicatrice magique',d:'Vulnérable à une Voix'},
      {n:'Mauvais calculateur',d:'−5 Initiative groupe'},{n:'Rancune',d:'Comportement contraint'},
      {n:'Malédiction',d:'−5 aléatoire stat/scène'},{n:'Objet hanté',d:'Perturbation narrative'},
      {n:'Ennemi juré',d:'Menace narrative'},{n:"Dette d'honneur",d:'Obligation future'},
      {n:'Instabilité magique',d:'Échec critique sur 96+'},{n:'Traumatisme combat',d:'Échec critique sur 96+'},
      {n:'Marqué dieu',d:'Interventions divines'},{n:'Corps affaibli',d:'−5 Corps permanent'},
      {n:'Destin contrarié',d:'MJ impose complication'},{n:'Cible du Destin',d:'Événement majeur/campagne'},
    ]},
  }

  const [advLevel, setAdvLevel] = useState<string|null>(null)
  const [selAdv, setSelAdv] = useState<any>(null)
  const [diceVal, setDiceVal] = useState<number|null>(null)
  const [rolling, setRolling] = useState(false)

  const rollDice = () => {
    if (rolling) return
    setRolling(true)
    let c = 0
    const iv = setInterval(() => {
      setDiceVal(Math.floor(Math.random()*20)+1)
      if (++c >= 14) { clearInterval(iv); setRolling(false); setDiceVal(Math.floor(Math.random()*20)+1) }
    }, 55)
  }

  const validatePair = () => {
    if (!selAdv || !diceVal || !advLevel) return
    const dis = ADV_DATA[advLevel].desavantages[diceVal-1]
    upd({pairs:[...st.pairs, {level:advLevel, levelLabel:ADV_DATA[advLevel].label, adv:selAdv, dis:{roll:diceVal,...dis}}]})
    setSelAdv(null); setDiceVal(null); setAdvLevel(null)
  }

  const Step4 = () => (
    <div>
      <h2 style={S.title}>4. Avantages & Désavantages</h2>
      <p style={S.sub}>Optionnel. Choisissez un avantage et tirez son désavantage (1d20).</p>

      <div style={{display:'flex',gap:6,marginBottom:'0.85rem',flexWrap:'wrap' as const}}>
        {['l','i','e'].map(l => (
          <button key={l} onClick={() => { setAdvLevel(l); setSelAdv(null); setDiceVal(null) }}
            style={{...S.btn,padding:'5px 14px',fontSize:12,
              background: advLevel===l?(l==='l'?'rgba(34,201,122,.2)':l==='i'?'rgba(127,119,221,.2)':'rgba(216,90,48,.15)'):'transparent',
              border: `1px solid ${advLevel===l?(l==='l'?'#22C97A':l==='i'?'#7F77DD':'#D85A30'):'#3D3960'}`,
              color: advLevel===l?(l==='l'?'#22C97A':l==='i'?'#7F77DD':'#FF9068'):'#9B96B8',
            }}>
            {l==='l'?'🪶 Léger':l==='i'?'🛡 Important':'👑 Extraordinaire'}
          </button>
        ))}
      </div>

      {advLevel && (
        <>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginBottom:'0.85rem'}}>
            {ADV_DATA[advLevel].avantages.map((a:any) => (
              <div key={a.n} onClick={() => { setSelAdv(a); setDiceVal(null) }}
                style={{background:selAdv?.n===a.n?'rgba(127,119,221,.1)':'#221F35',border:selAdv?.n===a.n?'2px solid #7F77DD':'1px solid #2E2B45',borderRadius:6,padding:'0.65rem 0.85rem',cursor:'pointer',position:'relative'}}>
                {selAdv?.n===a.n && <span style={{position:'absolute',top:5,right:7,fontSize:11,color:'#7F77DD',fontWeight:700}}>✓</span>}
                <div style={{fontSize:12,fontWeight:600,color:'#E8E6F0',marginBottom:2}}>{a.n}</div>
                <div style={{fontSize:11,color:'#9B96B8'}}>{a.e}</div>
              </div>
            ))}
          </div>

          {selAdv && (
            <div style={S.card}>
              <p style={{...S.label,marginBottom:'0.5rem'}}>Désavantage — lancer 1d20</p>
              <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:'0.65rem',flexWrap:'wrap' as const}}>
                <button onClick={rollDice} style={{...S.btn,...S.btnP,display:'inline-flex',alignItems:'center',gap:5}}>🎲 Lancer 1d20</button>
                <span style={{fontSize:12,color:'#6B6589'}}>— ou —</span>
                <input type="number" min={1} max={20} placeholder="1–20"
                  style={{...S.input,width:64,textAlign:'center' as const}}
                  onChange={e => { const n=parseInt(e.target.value); if(n>=1&&n<=20) setDiceVal(n) }} />
              </div>
              {diceVal && (
                <div style={{background:'#221F35',borderLeft:`3px solid #7F77DD`,borderRadius:'0 6px 6px 0',padding:'0.7rem 0.9rem',marginBottom:'0.65rem'}}>
                  <div style={{fontSize:12,color:'#9B96B8',marginBottom:2}}>d20 : {diceVal}</div>
                  <div style={{fontSize:13,fontWeight:600,color:'#E8E6F0'}}>{ADV_DATA[advLevel].desavantages[diceVal-1]?.n}</div>
                  <div style={{fontSize:12,color:'#9B96B8'}}>{ADV_DATA[advLevel].desavantages[diceVal-1]?.d}</div>
                </div>
              )}
              <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                <button onClick={() => setDiceVal(null)} style={{...S.btn,...S.btnS,fontSize:11,padding:'5px 12px'}}>Relancer</button>
                <button onClick={validatePair} disabled={!diceVal}
                  style={{...S.btn,...S.btnP,fontSize:11,padding:'5px 12px',opacity:!diceVal?0.35:1}}>Confirmer ✓</button>
              </div>
            </div>
          )}
        </>
      )}

      {st.pairs.length > 0 && (
        <div style={S.card}>
          <p style={{...S.label,marginBottom:'0.5rem'}}>Paires retenues</p>
          {st.pairs.map((p:any,i:number) => (
            <div key={i} style={{display:'flex',alignItems:'flex-start',gap:8,padding:'0.55rem 0',borderBottom:'1px solid #2E2B45'}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',gap:6,marginBottom:3,flexWrap:'wrap' as const}}>
                  <span style={{fontSize:10,padding:'2px 7px',borderRadius:10,background:'rgba(34,201,122,.15)',color:'#22C97A',border:'1px solid rgba(34,201,122,.2)'}}>{p.levelLabel}</span>
                  <span style={{fontSize:13,fontWeight:600,color:'#E8E6F0'}}>{p.adv.n}</span>
                  <span style={{fontSize:11,color:'#9B96B8'}}>{p.adv.e}</span>
                </div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap' as const}}>
                  <span style={{fontSize:9,color:'#6B6589'}}>↓</span>
                  <span style={{fontSize:10,padding:'2px 7px',borderRadius:10,background:'#221F35',color:'#9B96B8',border:'1px solid #3D3960'}}>d20:{p.dis.roll}</span>
                  <span style={{fontSize:12,color:'#E8E6F0'}}>{p.dis.n}</span>
                  <span style={{fontSize:11,color:'#9B96B8'}}>{p.dis.d}</span>
                </div>
              </div>
              <button onClick={() => upd({pairs:st.pairs.filter((_:any,j:number)=>j!==i)})}
                style={{background:'none',border:'none',color:'#6B6589',cursor:'pointer',fontSize:14}}>×</button>
            </div>
          ))}
        </div>
      )}

      <div style={S.nav}>
        <button style={{...S.btn,...S.btnS}} onClick={() => upd({step:3})}>← Retour</button>
        <button style={{...S.btn,...S.btnP}} onClick={() => upd({step:5})}>Suivant → <span style={{fontSize:10,opacity:.7}}>(optionnel)</span></button>
      </div>
    </div>
  )

  // ══════════════════════════════════════════════════════════════
  // STEP 5 — VOIX
  // ══════════════════════════════════════════════════════════════
  const Step5 = () => (
    <div>
      <h2 style={S.title}>5. Voix</h2>
      <p style={S.sub}>Voix Universelle automatique. Choisissez votre Voix spécialisée. Score de départ 10, jamais supérieur à l'Esprit ({esp}).</p>

      <div style={S.card}>
        <p style={{...S.label,marginBottom:'0.5rem'}}>Scores de Voix (départ : 10, max = Esprit {esp})</p>
        <div style={{marginBottom:'0.5rem'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:'0.5rem',flexWrap:'wrap' as const}}>
            <span style={{fontSize:12,color:'#9B96B8',width:140,flexShrink:0}}>Voix Universelle</span>
            <input type="number" min={10} max={100} value={st.vUniv}
              onChange={e => upd({vUniv:parseInt(e.target.value)||10})}
              style={{...S.input,width:65,textAlign:'center' as const,fontSize:14,fontWeight:600}} />
            <span style={{fontSize:11,color:st.vUniv>esp?'#FF9068':'#22C97A'}}>{st.vUniv>esp?`⚠ Plafonné à ${esp}`:'✓'}</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap' as const,opacity:st.voice?1:0.4}}>
            <span style={{fontSize:12,color:'#9B96B8',width:140,flexShrink:0}}>{st.voice?.name||'Voix spécialisée'}</span>
            <input type="number" min={10} max={100} value={st.vSpec}
              onChange={e => upd({vSpec:parseInt(e.target.value)||10})}
              style={{...S.input,width:65,textAlign:'center' as const,fontSize:14,fontWeight:600}} />
            <span style={{fontSize:11,color:st.vSpec>esp?'#FF9068':'#22C97A'}}>{st.vSpec>esp?`⚠ Plafonné à ${esp}`:'✓'}</span>
          </div>
        </div>
        <div style={{fontSize:11,color:'#9B96B8',padding:'0.5rem 0.75rem',background:'#221F35',borderRadius:6,marginTop:'0.4rem'}}>
          Univ. : {uEff} → {cu.label} · {cu.sorts} sorts · +{cu.ren} Ren. &nbsp;|&nbsp;
          Spec. : {sEff} → {cs.label} · {cs.sorts} sorts · +{cs.ren} Ren. &nbsp;|&nbsp;
          <strong style={{color:'#FAC775'}}>Renommée totale : {renTotal}</strong>
        </div>
      </div>

      <div style={{background:'rgba(127,119,221,.1)',border:'1px solid rgba(127,119,221,.3)',borderRadius:6,padding:'0.8rem 0.95rem',marginBottom:'0.65rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontSize:13,fontWeight:600,color:'#E8E6F0'}}>Voix Universelle</div>
          <div style={{fontSize:11,color:'#9B96B8',marginTop:1}}>Maintient, stabilise — présente en tout être pensant.</div>
        </div>
        <div style={{fontSize:18,fontWeight:700,color:'#7F77DD'}}>{uEff}</div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginBottom:'0.85rem'}}>
        {VOICES.map((v:any) => (
          <div key={v.id} onClick={() => upd({voice:v})}
            style={{background:st.voice?.id===v.id?'rgba(34,201,122,.08)':'#221F35',border:st.voice?.id===v.id?'2px solid #22C97A':'1px solid #2E2B45',borderRadius:6,padding:'0.7rem 0.9rem',cursor:'pointer',position:'relative'}}>
            {st.voice?.id===v.id && <span style={{position:'absolute',top:7,right:8,fontSize:11,color:'#22C97A',fontWeight:700}}>✓</span>}
            <div style={{fontSize:12,fontWeight:600,color:'#E8E6F0',marginBottom:2}}>{v.name}</div>
            <div style={{display:'flex',gap:4,flexWrap:'wrap' as const}}>
              {v.tags.map((t:string) => <span key={t} style={{fontSize:9,padding:'2px 6px',borderRadius:8,background:'rgba(34,201,122,.12)',color:'#22C97A',border:'1px solid rgba(34,201,122,.2)'}}>{t}</span>)}
            </div>
          </div>
        ))}
      </div>

      {st.voice && (
        <div style={{...S.warn,color:'#9B96B8',background:'rgba(127,119,221,.08)',border:'1px solid rgba(127,119,221,.2)'}}>
          ⚠ Sorts attribués par Vaela/MJ · 1 seul Rituel actif · 1 seul sort Instantané/tour · PM perdus sur échec
        </div>
      )}

      <div style={S.nav}>
        <button style={{...S.btn,...S.btnS}} onClick={() => upd({step:4})}>← Retour</button>
        <button style={{...S.btn,...S.btnP,opacity:!st.voice?0.35:1}} disabled={!st.voice} onClick={() => upd({step:6})}>Suivant →</button>
      </div>
    </div>
  )

  // ══════════════════════════════════════════════════════════════
  // STEP 6 — ÉQUIPEMENT (simplifié)
  // ══════════════════════════════════════════════════════════════
  const WEAPONS_LIST = [
    {cat:'legere',n:'Dague',dmg:4,exig:10},{cat:'legere',n:'Épée courte',dmg:5,exig:20},
    {cat:'legere',n:'Rapière',dmg:6,exig:25},{cat:'intermediaire',n:'Épée longue',dmg:8,exig:35},
    {cat:'intermediaire',n:'Masse',dmg:9,exig:40},{cat:'intermediaire',n:'Lance',dmg:8,exig:30},
    {cat:'lourde',n:'Hache lourde',dmg:12,exig:50},{cat:'lourde',n:'Espadon',dmg:14,exig:55},
    {cat:'distance',n:'Arc court',dmg:6,exig:20},{cat:'distance',n:'Arc long',dmg:10,exig:40},
    {cat:'distance',n:'Arbalète',dmg:15,exig:35},
  ]
  const ARMORS_LIST = [
    {cat:'legere',n:'Sans armure',red:0,iaM:0,agiM:0},{cat:'legere',n:'Cuir souple',red:2,iaM:0,agiM:0},
    {cat:'legere',n:'Cuir renforcé',red:3,iaM:0,agiM:2},{cat:'intermediaire',n:'Brigandine',red:4,iaM:5,agiM:5},
    {cat:'intermediaire',n:'Cotte de mailles',red:5,iaM:0,agiM:10},{cat:'lourde',n:'Demi-plate',red:6,iaM:10,agiM:10},
    {cat:'lourde',n:'Armure complète',red:8,iaM:10,agiM:15},
  ]
  const SHIELDS_LIST = [
    {n:'Aucun',id:0},{n:'Petit bouclier',id:5},{n:'Bouclier standard',id:10},{n:'Grand bouclier',id:15,agiM:5},
  ]

  const Step6 = () => (
    <div>
      <h2 style={S.title}>6. Équipement</h2>
      <p style={S.sub}>Choisissez votre arme, armure, bouclier et gérez votre inventaire.</p>

      <div style={S.card}>
        <p style={{...S.label,marginBottom:'0.5rem'}}>Bourse de départ</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
          {[['SO','#FAC775'],['CA','#9B96B8'],['DC','#CD7F32']].map(([coin,color]) => (
            <div key={coin} style={{background:'#221F35',border:'1px solid #3D3960',borderRadius:6,padding:'0.6rem',textAlign:'center' as const}}>
              <div style={{fontSize:11,color:color as string,fontWeight:700,marginBottom:3}}>{coin}</div>
              <input type="number" min={0} value={(st.bourse as any)[coin]}
                onChange={e => upd({bourse:{...st.bourse,[coin]:parseInt(e.target.value)||0}})}
                style={{...S.input,textAlign:'center' as const}} />
            </div>
          ))}
        </div>
      </div>

      <div style={S.card}>
        <p style={{...S.label,marginBottom:'0.5rem'}}>Arme principale</p>
        <div style={{maxHeight:200,overflowY:'auto' as const}}>
          {WEAPONS_LIST.map(w => (
            <div key={w.n} onClick={() => upd({weapon:w})}
              style={{display:'flex',alignItems:'center',gap:8,padding:'0.6rem 0.85rem',marginBottom:5,background:st.weapon?.n===w.n?'rgba(250,199,117,.08)':'#221F35',border:st.weapon?.n===w.n?'1px solid #FAC775':'1px solid #2E2B45',borderRadius:6,cursor:'pointer'}}>
              <span style={{flex:1,fontSize:12,color:'#E8E6F0'}}>{w.n}</span>
              <span style={{fontSize:10,padding:'2px 6px',borderRadius:8,background:'rgba(216,90,48,.2)',color:'#FF9068',border:'1px solid rgba(216,90,48,.2)'}}>Dég.{w.dmg}</span>
              <span style={{fontSize:10,padding:'2px 6px',borderRadius:8,background:'rgba(127,119,221,.2)',color:'#7F77DD',border:'1px solid rgba(127,119,221,.2)'}}>Corps≥{w.exig}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={S.card}>
        <p style={{...S.label,marginBottom:'0.5rem'}}>Armure</p>
        <div style={{maxHeight:180,overflowY:'auto' as const}}>
          {ARMORS_LIST.map(a => (
            <div key={a.n} onClick={() => upd({armor:a})}
              style={{display:'flex',alignItems:'center',gap:8,padding:'0.6rem 0.85rem',marginBottom:5,background:st.armor?.n===a.n?'rgba(250,199,117,.08)':'#221F35',border:st.armor?.n===a.n?'1px solid #FAC775':'1px solid #2E2B45',borderRadius:6,cursor:'pointer'}}>
              <span style={{flex:1,fontSize:12,color:'#E8E6F0'}}>{a.n}</span>
              {a.red>0 && <span style={{fontSize:10,padding:'2px 6px',borderRadius:8,background:'rgba(216,90,48,.2)',color:'#FF9068',border:'1px solid rgba(216,90,48,.2)'}}>−{a.red} dég.</span>}
              {a.iaM>0 && <span style={{fontSize:10,padding:'2px 6px',borderRadius:8,background:'rgba(127,119,221,.2)',color:'#7F77DD',border:'1px solid rgba(127,119,221,.2)'}}>−{a.iaM} IA</span>}
            </div>
          ))}
        </div>
      </div>

      <div style={S.card}>
        <p style={{...S.label,marginBottom:'0.5rem'}}>Bouclier</p>
        <div style={{display:'flex',gap:7,flexWrap:'wrap' as const}}>
          {SHIELDS_LIST.map(s => (
            <div key={s.n} onClick={() => upd({shield:s})}
              style={{padding:'0.6rem 0.85rem',background:st.shield?.n===s.n?'rgba(34,201,122,.08)':'#221F35',border:st.shield?.n===s.n?'1px solid #22C97A':'1px solid #2E2B45',borderRadius:6,cursor:'pointer',fontSize:12,color:'#E8E6F0'}}>
              {s.n}{s.id>0?` (+${s.id} ID)`:''}
            </div>
          ))}
        </div>
      </div>

      <div style={S.card}>
        <p style={{...S.label,marginBottom:'0.5rem'}}>Inventaire</p>
        <div style={{display:'flex',gap:7,marginBottom:'0.6rem',flexWrap:'wrap' as const}}>
          {['Torche','Rations (3j)','Corde 15m','Trousse médicale','Kit crochetage','Lanterne'].map(o => (
            <span key={o} onClick={() => {
              const ex = st.inv.find(i=>i.n===o)
              if(ex) upd({inv:st.inv.map(i=>i.n===o?{...i,qty:i.qty+1}:i)})
              else upd({inv:[...st.inv,{n:o,qty:1}]})
            }} style={{fontSize:10,padding:'2px 8px',borderRadius:10,background:'#221F35',border:'1px solid #3D3960',cursor:'pointer',color:'#9B96B8'}}>{o}</span>
          ))}
        </div>
        {st.inv.map((it,i) => (
          <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'0.45rem 0.75rem',background:'#221F35',border:'1px solid #2E2B45',borderRadius:6,marginBottom:4}}>
            <span style={{flex:1,fontSize:12,color:'#E8E6F0'}}>{it.n}</span>
            <input type="number" min={0} value={it.qty}
              onChange={e => {
                const qty = parseInt(e.target.value)||0
                if(qty===0) upd({inv:st.inv.filter((_,j)=>j!==i)})
                else upd({inv:st.inv.map((x,j)=>j===i?{...x,qty}:x)})
              }}
              style={{...S.input,width:40,textAlign:'center' as const}} />
            <button onClick={() => upd({inv:st.inv.filter((_,j)=>j!==i)})}
              style={{background:'none',border:'none',color:'#6B6589',cursor:'pointer',fontSize:14}}>×</button>
          </div>
        ))}
        <div style={{display:'flex',gap:7,marginTop:'0.4rem'}}>
          <input id="invInput" type="text" placeholder="Ajouter un objet..."
            style={{...S.input,flex:1}} onKeyDown={e => {
              if(e.key==='Enter') {
                const val = (e.target as HTMLInputElement).value.trim()
                if(val) { upd({inv:[...st.inv,{n:val,qty:1}]}); (e.target as HTMLInputElement).value='' }
              }
            }} />
          <button style={{...S.btn,...S.btnP,fontSize:11}} onClick={() => {
            const inp = document.getElementById('invInput') as HTMLInputElement
            if(inp?.value.trim()) { upd({inv:[...st.inv,{n:inp.value.trim(),qty:1}]}); inp.value='' }
          }}>+ Ajouter</button>
        </div>
      </div>

      <div style={S.nav}>
        <button style={{...S.btn,...S.btnS}} onClick={() => upd({step:5})}>← Retour</button>
        <button style={{...S.btn,...S.btnP}} onClick={() => upd({step:7})}>Suivant →</button>
      </div>
    </div>
  )

  // ══════════════════════════════════════════════════════════════
  // STEP 7 — IDENTITÉ
  // ══════════════════════════════════════════════════════════════
  const Step7 = () => (
    <div>
      <h2 style={S.title}>7. Identité & Position dans le monde</h2>
      <p style={S.sub}>Ancrez votre personnage dans Canticua.</p>
      <div style={{display:'flex',flexDirection:'column' as const,gap:9}}>
        {[
          ['nom','Nom du personnage','Choisissez un nom...'],
          ['concept','Concept / rôle','Ex : guerrier nomade, érudit exilé...'],
          ['origine','Origine (monde, région)','Ex : Unys, Pern...'],
          ['intention','Intention','Ce que le personnage veut...'],
          ['faction','Attachement (Voix / Foi / Faction)','Tour des Mages, clergé...'],
          ['relations','Relations notables','Mentor, rival, dette...'],
        ].map(([key,lbl,ph]) => (
          <div key={key}>
            <label style={S.label}>{lbl}</label>
            <input type="text" value={(st as any)[key]} placeholder={ph}
              onChange={e => upd({[key]:e.target.value} as any)}
              style={S.input} />
          </div>
        ))}
        <div>
          <label style={S.label}>Histoire courte</label>
          <textarea value={st.bio} placeholder="Quelques lignes sur son passé..."
            onChange={e => upd({bio:e.target.value})}
            style={{...S.input,resize:'vertical' as const,minHeight:60}} />
        </div>
      </div>
      <div style={S.nav}>
        <button style={{...S.btn,...S.btnS}} onClick={() => upd({step:6})}>← Retour</button>
        <button style={{...S.btn,...S.btnP}} onClick={() => upd({step:8})}>Voir la fiche →</button>
      </div>
    </div>
  )

  // ══════════════════════════════════════════════════════════════
  // STEP 8 — FICHE
  // ══════════════════════════════════════════════════════════════
  const Step8 = () => {
    const finalStats = Object.fromEntries(STATS.map(s => [s, getFinal(st.base, st.race, st.hPicks, s)]))
    const agiEff = finalStats['Agilité'] - (st.shield?.agiM||0) - (st.armor?.agiM||0)
    const ia = finalStats['Corps'] - (st.armor?.iaM||0) - (st.weapon?.exig>finalStats['Corps']?10:0)
    const id_ = Math.floor((finalStats['Corps']+agiEff)/2) + (st.shield?.id||0)
    const allSkills = [...st.major,...st.minor].map(sk => {
      const rb = st.race?.compBonus?.[sk]||0
      return {n:sk, v:(st.major.includes(sk)?10:5)+rb, maj:st.major.includes(sk)}
    })

    return (
      <div>
        <h2 style={{...S.title,fontSize:22}}>{st.nom||'Personnage sans nom'}</h2>
        <div style={{fontSize:13,color:'#9B96B8',marginBottom:'1rem'}}>{st.race?.name} · {st.concept||'Concept non défini'} {st.origine?`· ${st.origine}`:''}</div>

        {/* Ressources */}
        <div style={{display:'flex',gap:7,flexWrap:'wrap' as const,marginBottom:'0.85rem'}}>
          {[['PV',pv,'#FF9068'],['PM',pm,'#4A9EE0'],['Initiative',`${initBase}+1d10`,'#7F77DD'],['Renommée',renTotal,'#FAC775'],['IA',ia,'#FAC775'],['ID',id_,'#22C97A']].map(([l,v,c])=>(
            <div key={l as string} style={{background:'#221F35',border:'1px solid #3D3960',borderRadius:6,padding:'0.55rem 0.85rem',textAlign:'center' as const,flex:1,minWidth:70}}>
              <div style={{fontSize:20,fontWeight:700,color:c as string}}>{v as any}</div>
              <div style={{fontSize:9,color:'#6B6589',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginTop:1}}>{l as string}</div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={S.card}>
          <p style={{fontSize:10,textTransform:'uppercase' as const,letterSpacing:'0.07em',color:'#6B6589',marginBottom:'0.6rem',fontWeight:700}}>Caractéristiques</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:7}}>
            {STATS.map(s => (
              <div key={s} style={{textAlign:'center' as const,padding:'7px',background:'#221F35',borderRadius:5}}>
                <div style={{fontSize:9,color:'#6B6589',textTransform:'uppercase' as const}}>{s}</div>
                <div style={{fontSize:18,fontWeight:700,color:'#E8E6F0'}}>{finalStats[s]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Compétences */}
        <div style={S.card}>
          <p style={{fontSize:10,textTransform:'uppercase' as const,letterSpacing:'0.07em',color:'#6B6589',marginBottom:'0.6rem',fontWeight:700}}>Compétences</p>
          <div style={{display:'flex',flexWrap:'wrap' as const,gap:4}}>
            {allSkills.map(sk => (
              <span key={sk.n} style={{fontSize:10,padding:'3px 7px',borderRadius:16,margin:2,
                background:sk.maj?'rgba(127,119,221,.2)':'rgba(34,201,122,.12)',
                color:sk.maj?'#7F77DD':'#22C97A',
                border:sk.maj?'1px solid rgba(127,119,221,.3)':'1px solid rgba(34,201,122,.2)'}}>
                {sk.n} <strong>+{sk.v}</strong>
              </span>
            ))}
          </div>
        </div>

        {/* Voix */}
        <div style={S.card}>
          <p style={{fontSize:10,textTransform:'uppercase' as const,letterSpacing:'0.07em',color:'#6B6589',marginBottom:'0.6rem',fontWeight:700}}>Voix & Magie</p>
          <div style={{display:'flex',flexDirection:'column' as const,gap:5}}>
            <div style={{padding:'0.5rem 0.7rem',background:'rgba(127,119,221,.1)',borderRadius:5}}>
              <div style={{fontSize:12,fontWeight:600,color:'#E8E6F0'}}>Voix Universelle</div>
              <div style={{fontSize:11,color:'#9B96B8'}}>Score : {uEff} · {cu.label} · {cu.sorts} sorts</div>
            </div>
            {st.voice && (
              <div style={{padding:'0.5rem 0.7rem',background:'rgba(34,201,122,.08)',borderRadius:5}}>
                <div style={{fontSize:12,fontWeight:600,color:'#22C97A'}}>{st.voice.name}</div>
                <div style={{fontSize:11,color:'#9B96B8'}}>Score : {sEff} · {cs.label} · {cs.sorts} sorts · Seuil = {sEff}+{esp}−Diff</div>
              </div>
            )}
            <div style={{fontSize:10,color:'#6B6589',padding:'0.4rem 0.5rem',background:'rgba(250,199,117,.05)',borderRadius:4}}>
              ★ Ren. : {st.race?.ren||0}(race) + {cu.ren}(Univ.) + {cs.ren}(Spec.) = {renTotal} · Dépenser 1 pt = modifier résultat d'1 point
            </div>
          </div>
        </div>

        {/* Équipement */}
        <div style={S.card}>
          <p style={{fontSize:10,textTransform:'uppercase' as const,letterSpacing:'0.07em',color:'#6B6589',marginBottom:'0.6rem',fontWeight:700}}>Équipement</p>
          <div style={{fontSize:12,display:'flex',flexDirection:'column' as const,gap:4}}>
            {st.weapon && <div><span style={{color:'#9B96B8'}}>Arme : </span><strong style={{color:'#E8E6F0'}}>{st.weapon.n}</strong> (Dég.{st.weapon.dmg}+{Math.floor(finalStats['Corps']/10)})</div>}
            {st.armor && <div><span style={{color:'#9B96B8'}}>Armure : </span><strong style={{color:'#E8E6F0'}}>{st.armor.n}</strong>{st.armor.red>0?` (−${st.armor.red} dég.)`:''}</div>}
            {st.shield?.id>0 && <div><span style={{color:'#9B96B8'}}>Bouclier : </span><strong style={{color:'#E8E6F0'}}>{st.shield.n}</strong> (+{st.shield.id} ID)</div>}
            {st.inv.length>0 && <div><span style={{color:'#9B96B8'}}>Inventaire : </span>{st.inv.map(i=>`${i.n}×${i.qty}`).join(', ')}</div>}
            <div style={{fontSize:10,color:'#6B6589'}}>Bourse : {st.bourse.SO} SO · {st.bourse.CA} CA · {st.bourse.DC} DC</div>
          </div>
        </div>

        {/* Avantages */}
        {st.pairs.length>0 && (
          <div style={S.card}>
            <p style={{fontSize:10,textTransform:'uppercase' as const,letterSpacing:'0.07em',color:'#6B6589',marginBottom:'0.6rem',fontWeight:700}}>Avantages & Désavantages</p>
            <div style={{display:'flex',flexWrap:'wrap' as const,gap:4}}>
              {st.pairs.map((p:any,i:number) => (
                <span key={i}>
                  <span style={{fontSize:10,padding:'3px 7px',borderRadius:16,background:'rgba(34,201,122,.12)',color:'#22C97A',border:'1px solid rgba(34,201,122,.2)'}}>{p.adv.n}</span>
                  <span style={{fontSize:10,margin:'0 4px',color:'#6B6589'}}>↓</span>
                  <span style={{fontSize:10,padding:'3px 7px',borderRadius:16,background:'rgba(216,90,48,.1)',color:'#FF9068',border:'1px solid rgba(216,90,48,.2)'}}>{p.dis.n}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Histoire */}
        {st.bio && (
          <div style={S.card}>
            <p style={{fontSize:10,textTransform:'uppercase' as const,letterSpacing:'0.07em',color:'#6B6589',marginBottom:'0.6rem',fontWeight:700}}>Histoire</p>
            <p style={{fontSize:12,color:'#9B96B8',lineHeight:1.6}}>{st.bio}</p>
          </div>
        )}

        {/* Formules */}
        <div style={{background:'rgba(127,119,221,.06)',border:'1px solid rgba(127,119,221,.15)',borderRadius:7,padding:'0.65rem 0.9rem',fontSize:10,color:'#6B6589',lineHeight:1.6,marginBottom:'1rem'}}>
          <strong style={{color:'#7F77DD'}}>Formules</strong> — IA mêlée = Corps+Comp−Fat·5−ArmIA · IA distance = Agi+Tir · ID = (Corps+Agi)÷2+Déf+Bouclier · Seuil combat = 40+IA−ID (5–95) · Seuil sort = Voix+Esprit−Diff
        </div>

        <div style={S.nav}>
          <button style={{...S.btn,...S.btnS}} onClick={() => upd({step:7})}>← Modifier</button>
          <button style={{...S.btn,...S.btnP,opacity:saving?0.5:1}} disabled={saving} onClick={savePersonnage}>
            {saving ? 'Sauvegarde...' : user ? '💾 Sauvegarder' : '🔒 Connexion pour sauvegarder'}
          </button>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════
  // RENDER PRINCIPAL
  // ══════════════════════════════════════════════════════════════
  return (
    <div style={S.wrap}>
      <div style={{maxWidth:820,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem'}}>
          <div>
            <h1 style={{fontSize:22,fontWeight:700,background:'linear-gradient(135deg,#fff 20%,#7F77DD 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
              Partitura — Création
            </h1>
            <p style={{fontSize:11,color:'#6B6589'}}>De Foi, de Gloire et de Sang</p>
          </div>
          <a href="/personnages" style={{fontSize:12,color:'#9B96B8',textDecoration:'none'}}>← Mes personnages</a>
        </div>

        <Steps />

        {st.step===1 && <Step1 />}
        {st.step===2 && <Step2 />}
        {st.step===3 && <Step3 />}
        {st.step===4 && <Step4 />}
        {st.step===5 && <Step5 />}
        {st.step===6 && <Step6 />}
        {st.step===7 && <Step7 />}
        {st.step===8 && <Step8 />}
      </div>
    </div>
  )
}