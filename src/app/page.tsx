import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4"
          style={{background:'linear-gradient(135deg, #0F0E17 0%, #1A1828 50%, #0F0E17 100%)'}}>

      {/* Logo / titre */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-3"
            style={{background:'linear-gradient(135deg, #FAC775, #7F77DD)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
          PARTITURA
        </h1>
        <p className="text-text2 text-lg italic">De Foi, de Gloire et de Sang</p>
        <div className="w-24 h-px bg-gold/40 mx-auto mt-4"></div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link href="/auth/login"
          className="btn-primary text-center py-3 text-base rounded-xl">
          Connexion / Inscription
        </Link>
        <Link href="/creation"
          className="btn-secondary text-center py-3 text-base rounded-xl">
          Créer un personnage (sans compte)
        </Link>
      </div>

      {/* Features */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl w-full text-center">
        {[
          { icon: '⚔', title: 'Wizard complet', desc: '8 étapes guidées selon les règles exactes du LdJ' },
          { icon: '☁', title: 'Sauvegarde cloud', desc: 'Personnages sauvegardés et accessibles partout' },
          { icon: '🔗', title: 'Partage MJ', desc: 'Lien unique pour partager ta fiche avec ton Meneur' },
        ].map(f => (
          <div key={f.title} className="card text-left">
            <div className="text-2xl mb-2">{f.icon}</div>
            <div className="font-semibold text-text mb-1">{f.title}</div>
            <div className="text-xs text-text2 leading-relaxed">{f.desc}</div>
          </div>
        ))}
      </div>
    </main>
  )
}
