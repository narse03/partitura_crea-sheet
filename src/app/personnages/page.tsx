'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function PersonnagesPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [personnages, setPersonnages] = useState<any[]>([])

  useEffect(() => {
    const supabase = createClient()
    let attempts = 0
    const check = setInterval(async () => {
      attempts++
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        clearInterval(check)
        setUser(session.user)
        // Charger les personnages
        const { data } = await supabase
          .from('personnages')
          .select('*')
          .eq('user_id', session.user.id)
          .order('updated_at', { ascending: false })
        setPersonnages(data || [])
        setLoading(false)
      } else if (attempts > 10) {
        clearInterval(check)
        window.location.href = '/auth/login'
      }
    }, 500)
    return () => clearInterval(check)
  }, [])

  if (loading) return (
    <div style={{background:'#0F0E17',minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12}}>
      <div style={{color:'#7F77DD',fontSize:24}}>⚔</div>
      <div style={{color:'#9B96B8',fontSize:14}}>Chargement...</div>
    </div>
  )

  return (
    <main style={{background:'#0F0E17',minHeight:'100vh'}}>
      <nav style={{background:'#1A1828',borderBottom:'1px solid #2E2B45',padding:'1rem 1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{fontWeight:700,fontSize:18,background:'linear-gradient(135deg,#FAC775,#7F77DD)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
          PARTITURA
        </span>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:12,color:'#6B6589'}}>{user?.email}</span>
          <button onClick={async () => {
            const supabase = createClient()
            await supabase.auth.signOut()
            window.location.href = '/'
          }} style={{fontSize:12,color:'#6B6589',background:'transparent',border:'1px solid #2E2B45',borderRadius:6,padding:'4px 12px',cursor:'pointer'}}>
            Déconnexion
          </button>
        </div>
      </nav>

      <div style={{maxWidth:900,margin:'0 auto',padding:'2rem 1rem'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem'}}>
          <h1 style={{fontSize:22,fontWeight:700,color:'#E8E6F0'}}>Mes Personnages</h1>
          <Link href="/creation" style={{background:'#534AB7',color:'#fff',padding:'8px 18px',borderRadius:6,fontSize:13,fontWeight:600,textDecoration:'none'}}>
            + Nouveau personnage
          </Link>
        </div>

        {personnages.length === 0 ? (
          <div style={{background:'#1A1828',border:'1px solid #2E2B45',borderRadius:10,padding:'3rem',textAlign:'center'}}>
            <div style={{fontSize:36,marginBottom:12}}>⚔</div>
            <p style={{color:'#9B96B8',marginBottom:16}}>Aucun personnage pour l'instant.</p>
            <Link href="/creation" style={{background:'#534AB7',color:'#fff',padding:'8px 18px',borderRadius:6,fontSize:13,fontWeight:600,textDecoration:'none'}}>
              Créer mon premier personnage
            </Link>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16}}>
            {personnages.map((p: any) => (
              <div key={p.id} style={{background:'#1A1828',border:'1px solid #2E2B45',borderRadius:10,padding:'1rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                  <div>
                    <div style={{fontSize:15,fontWeight:700,color:'#E8E6F0'}}>{p.nom}</div>
                    <div style={{fontSize:12,color:'#9B96B8'}}>{p.race}</div>
                  </div>
                  <span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:'rgba(127,119,221,.15)',color:'#7F77DD',border:'1px solid rgba(127,119,221,.25)'}}>
                    Ren. {p.data?.renommee ?? '?'}
                  </span>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginBottom:10}}>
                  {[['PV',p.data?.pv,'#FF9068'],['PM',p.data?.pm,'#4A9EE0'],['IA',p.data?.ia,'#FAC775']].map(([l,v,c])=>(
                    <div key={l as string} style={{textAlign:'center',padding:'6px',background:'#221F35',borderRadius:6}}>
                      <div style={{fontSize:9,color:'#6B6589',textTransform:'uppercase'}}>{l as string}</div>
                      <div style={{fontSize:16,fontWeight:700,color:c as string}}>{v as any ?? '?'}</div>
                    </div>
                  ))}
                </div>
                {p.data?.voiceName && <div style={{fontSize:11,color:'#6B6589',marginBottom:10}}>✦ {p.data.voiceName}</div>}
                <div style={{display:'flex',gap:6,paddingTop:8,borderTop:'1px solid #2E2B45'}}>
                  <Link href={`/fiche/${p.share_token}`} style={{flex:1,textAlign:'center',fontSize:11,padding:'5px',borderRadius:6,background:'#221F35',color:'#9B96B8',textDecoration:'none'}}>
                    Voir
</Link>
<Link href={`/creation?edit=${p.id}`} style={{flex:1,textAlign:'center',fontSize:11,padding:'5px',borderRadius:6,background:'rgba(127,119,221,.15)',color:'#7F77DD',textDecoration:'none',border:'1px solid rgba(127,119,221,.2)'}}>
  ✏ Modifier
</Link>
                  <button onClick={async () => {
                    const url = `${window.location.origin}/fiche/${p.share_token}`
                    await navigator.clipboard.writeText(url)
                    alert('Lien copié !')
                  }} style={{flex:1,fontSize:11,padding:'5px',borderRadius:6,background:'#221F35',color:'#9B96B8',border:'none',cursor:'pointer'}}>
                    🔗 Partager
                  </button>
                  <button onClick={async () => {
                    if(!confirm('Supprimer ce personnage ?')) return
                    const supabase = createClient()
                    await supabase.from('personnages').delete().eq('id', p.id)
                    setPersonnages(prev => prev.filter(x => x.id !== p.id))
                  }} style={{fontSize:11,padding:'5px 8px',borderRadius:6,background:'rgba(216,90,48,.1)',color:'#FF9068',border:'1px solid rgba(216,90,48,.2)',cursor:'pointer'}}>
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}