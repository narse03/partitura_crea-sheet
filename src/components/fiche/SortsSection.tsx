'use client'

import { useState } from 'react'
const CERCLES = [
  {min:0,max:30,label:'Novice',sorts:3},
  {min:31,max:50,label:'Pratiquant',sorts:6},
  {min:51,max:70,label:'Expert',sorts:9},
  {min:71,max:85,label:'Maître',sorts:12},
  {min:86,max:999,label:'Magistère',sorts:15},
]

const CAT_UNLOCK: Record<string,number> = {
  mineurs:0, utilitaires:31, tactiques:51, signature:71, rituels:86
}
const CAT_LABELS: Record<string,string> = {
  mineurs:'Gestes mineurs', utilitaires:'Utilitaires', tactiques:'Tactiques', signature:'Signature', rituels:'Rituels'
}
const TYPE_LABELS: Record<string,string> = {I:'Instantané',S:'Standard',C:'Concentration',R:'Rituel'}
const TYPE_COLORS: Record<string,string> = {
  I:'rgba(34,201,122,.15)',S:'rgba(127,119,221,.15)',C:'rgba(250,199,117,.15)',R:'rgba(216,90,48,.15)'
}
const TYPE_TEXT: Record<string,string> = {I:'#22C97A',S:'#7F77DD',C:'#FAC775',R:'#FF9068'}

const SORTS: Record<string,Record<string,any[]>> = {
  universelle:{
    mineurs:[
      {n:'Petite Étincelle',diff:15,pm:3,type:'I',dur:'Instantané',effet:'Allume flamme ou combustible'},
      {n:'Main Propre',diff:15,pm:3,type:'I',dur:'Instantané',effet:'Nettoie équipement ; +5 Étiquette 1 min'},
      {n:'Murmure Clair',diff:15,pm:3,type:'I',dur:'Instantané',effet:'Message mental court (portée : visible)'},
      {n:'Outil de Fortune',diff:15,pm:3,type:'S',dur:'10 min',effet:'+5 Artisanat ou Dextérité pour une action'},
      {n:'Flammèche',diff:15,pm:3,type:'S',dur:'1 min',effet:'Lumière faible ; +5 Observation'},
    ],
    utilitaires:[
      {n:'Chemin',diff:20,pm:6,type:'S',dur:'1 h',effet:'+10 Orientation'},
      {n:'Purification de l\'eau',diff:20,pm:6,type:'S',dur:'Instantané',effet:'Neutralise poison dans l\'eau'},
      {n:'Sens aiguisés',diff:20,pm:6,type:'C',dur:'10 min',effet:'+5 Observation et Écoute'},
      {n:'Réparation express',diff:20,pm:6,type:'S',dur:'Instantané',effet:'+10 Artisanat pour réparer'},
      {n:'Récupération',diff:20,pm:6,type:'S',dur:'Instantané',effet:'Récupère projectiles'},
    ],
    tactiques:[
      {n:'Aux Aguets',diff:25,pm:8,type:'C',dur:'10 min',effet:'+5 Initiative et Observation'},
      {n:'Pas Silencieux',diff:25,pm:8,type:'C',dur:'2 min',effet:'+10 Discrétion'},
      {n:'Souffle Régulier',diff:25,pm:8,type:'I',dur:'3 tours',effet:'+5 Sang-froid'},
      {n:'Boule de Lumière',diff:25,pm:8,type:'C',dur:'10 min',effet:'Lumière forte ; −5 Discrétion ennemie'},
      {n:'Façade Convenable',diff:25,pm:8,type:'S',dur:'1 h',effet:'+5 Persuasion et Étiquette'},
    ],
    signature:[
      {n:'Bouclier d\'Urgence',diff:30,pm:10,type:'I',dur:'1 attaque',effet:'+5 ID contre une attaque'},
      {n:'Passage Discret',diff:30,pm:10,type:'C',dur:'2 min',effet:'Groupe +10 Discrétion'},
      {n:'Solution Improbable',diff:35,pm:12,type:'S',dur:'Instantané',effet:'+5 IA ou ID pour une action'},
    ],
    rituels:[
      {n:'Pacte de Parole',diff:50,pm:25,pv:2,type:'R',incant:'30 min',dur:'10 min',effet:'−10 Tromperie entre participants'},
      {n:'Voix Liée',diff:55,pm:32,pv:3,type:'R',incant:'1 h',dur:'1 h',effet:'Communication mentale illimitée'},
      {n:'Destin Tordu',diff:75,pm:55,pv:6,type:'R',incant:'4 h',dur:'1 scène',effet:'Groupe +5 IA et +5 ID'},
    ]
  },
  armes:{
    mineurs:[
      {n:'Fracas',diff:15,pm:3,type:'I',dur:'1 attaque',effet:'+3 dégâts prochaine attaque'},
      {n:'Frappe du Poing Dur',diff:15,pm:3,type:'I',dur:'1 attaque',effet:'Mains nues +5 IA'},
      {n:'Posture de Menace',diff:15,pm:3,type:'I',dur:'1 tour',effet:'Cible −5 IA contre lanceur'},
      {n:'Cri de Guerre',diff:15,pm:3,type:'I',dur:'1 tour',effet:'Allié +5 IA prochaine attaque'},
      {n:'Analyse Martiale',diff:15,pm:3,type:'S',dur:'3 tours',effet:'+5 IA contre cible observée'},
      {n:'Garde Rapide',diff:15,pm:3,type:'I',dur:'1 attaque',effet:'+5 ID contre une attaque'},
    ],
    utilitaires:[
      {n:'Vitesse de Frappe',diff:20,pm:6,type:'I',dur:'1 tour',effet:'+5 Initiative'},
      {n:'Enchaînement',diff:20,pm:6,type:'I',dur:'1 tour',effet:'2 attaques ce tour, chaque −5 IA'},
      {n:'Sacrifice',diff:20,pm:6,type:'I',dur:'1 attaque',effet:'Sacrifie 3 PV → +5 dégâts'},
      {n:'Regard de Duel',diff:20,pm:6,type:'S',dur:'1 tour',effet:'Cible −5 IA contre lanceur'},
      {n:'Coup dans l\'Arme',diff:20,pm:6,type:'I',dur:'1 tour',effet:'Cible −5 IA'},
    ],
    tactiques:[
      {n:'Parade Instinctive',diff:25,pm:8,type:'I',dur:'1 attaque',effet:'+5 ID contre une attaque'},
      {n:'Charge Percutante',diff:25,pm:8,type:'S',dur:'Instantané',effet:'+5 IA et repousse cible'},
      {n:'Brise-Garde',diff:25,pm:8,type:'I',dur:'1 attaque',effet:'Ignore parade ou bouclier'},
      {n:'Coup Décisif',diff:25,pm:8,type:'I',dur:'1 attaque',effet:'+5 dégâts'},
      {n:'Pression Martiale',diff:25,pm:8,type:'S',dur:'3 tours',effet:'Ennemi −5 ID contre lanceur'},
    ],
    signature:[
      {n:'Peau de Guerre',diff:30,pm:10,type:'S',dur:'3 tours',effet:'Réduction −5 dégâts physiques'},
      {n:'Fracasse-Écu',diff:30,pm:10,type:'I',dur:'1 attaque',effet:'Détruit bouclier non magique'},
      {n:'Tempête de Lames',diff:30,pm:10,type:'S',dur:'1 tour',effet:'Frappe 2 ennemis proches +5 IA'},
      {n:'Défi du Titan',diff:35,pm:12,type:'S',dur:'3 tours',effet:'+5 IA, +5 dégâts, +5 Sang-froid'},
      {n:'Onde de Choc',diff:35,pm:12,type:'S',dur:'Instantané',effet:'Ennemis Acrobatie Diff 25 ou chute'},
    ],
    rituels:[
      {n:'Serment de Duel',diff:40,pm:15,pv:2,type:'R',incant:'15 min',dur:'2 min',effet:'2 combattants +5 IA l\'un contre l\'autre'},
      {n:'Marque du Combattant',diff:45,pm:18,pv:2,type:'R',incant:'30 min',dur:'24 h',effet:'Arme enchantée +5 IA'},
      {n:'Peau de Bataille',diff:55,pm:30,pv:3,type:'R',incant:'45 min',dur:'5 min',effet:'Réduction −8 dégâts physiques'},
      {n:'Champion de Guerre',diff:75,pm:55,pv:6,type:'R',incant:'3 h',dur:'5 min',effet:'+10 IA / +5 dégâts / +5 ID'},
    ]
  },
  sauvage:{
    mineurs:[
      {n:'Griffes de l\'Instinct',diff:15,pm:3,type:'I',dur:'1 attaque',effet:'Mains nues +3 dégâts'},
      {n:'Saut Animal',diff:15,pm:3,type:'I',dur:'Instantané',effet:'+5 Athlétisme saut'},
      {n:'Peau Rugueuse',diff:15,pm:3,type:'I',dur:'1 attaque',effet:'Réduction −3 dégâts physiques'},
      {n:'Regard du Prédateur',diff:15,pm:3,type:'S',dur:'3 tours',effet:'+5 Observation contre cible'},
      {n:'Oreille Sauvage',diff:15,pm:3,type:'S',dur:'3 tours',effet:'+5 Écoute'},
    ],
    utilitaires:[
      {n:'Piste Vivante',diff:20,pm:6,type:'S',dur:'10 min',effet:'+10 Pistage'},
      {n:'Course du Loup',diff:20,pm:6,type:'S',dur:'1 min',effet:'+5 Athlétisme, ignore terrain difficile'},
      {n:'Instinct de Fuite',diff:20,pm:6,type:'I',dur:'1 tour',effet:'+5 Initiative pour fuir'},
      {n:'Peau de Bête',diff:20,pm:6,type:'S',dur:'3 tours',effet:'Réduction −3 dégâts physiques'},
      {n:'Éveil des Sens',diff:20,pm:6,type:'C',dur:'10 min',effet:'+5 Observation et Écoute'},
    ],
    tactiques:[
      {n:'Bond du Fauve',diff:25,pm:8,type:'I',dur:'1 attaque',effet:'+5 IA après déplacement'},
      {n:'Hurlement Terrifiant',diff:25,pm:8,type:'S',dur:'1 tour',effet:'Ennemis proches −5 ID'},
      {n:'Crocs Invisibles',diff:25,pm:8,type:'I',dur:'1 attaque',effet:'Ignore 3 points d\'armure'},
      {n:'Traque Implacable',diff:25,pm:8,type:'S',dur:'10 min',effet:'+10 Pistage et Observation'},
      {n:'Réflexes du Fauve',diff:25,pm:8,type:'I',dur:'1 attaque',effet:'+10 ID contre une attaque'},
    ],
    signature:[
      {n:'Forme Bestiale',diff:30,pm:10,type:'S',dur:'3 tours',effet:'+5 IA, +5 Athlétisme, mains nues +5 dég.'},
      {n:'Peau d\'Écorce',diff:30,pm:10,type:'S',dur:'5 tours',effet:'Réduction −5 dégâts physiques'},
      {n:'Rage du Sang',diff:35,pm:12,type:'S',dur:'3 tours',effet:'+8 dégâts mais −5 ID'},
      {n:'Sens du Prédateur',diff:30,pm:10,type:'C',dur:'10 min',effet:'+10 Observation, Pistage, Intuition'},
    ],
    rituels:[
      {n:'Appel de la Meute',diff:40,pm:15,pv:1,type:'R',incant:'20 min',dur:'10 min',effet:'Animaux amicaux ; +5 Leadership'},
      {n:'Peau de la Terre',diff:55,pm:30,pv:3,type:'R',incant:'1 h',dur:'10 min',effet:'Réduction −8 dégâts physiques'},
      {n:'Avatar Sauvage',diff:80,pm:60,pv:6,type:'R',incant:'4 h',dur:'5 min',effet:'+10 IA, +8 dégâts, −5 dégâts subis'},
    ]
  },
  dieux:{
    mineurs:[
      {n:'Prière Apaisante',diff:15,pm:3,type:'I',dur:'Instantané',effet:'Supprime peur légère. +5 Sang-froid'},
      {n:'Geste de Guérison',diff:15,pm:3,type:'I',dur:'Instantané',effet:'Soigne 1d6+2 PV. Stoppe saignement'},
      {n:'Mot de Réprobation',diff:15,pm:3,type:'I',dur:'1 tour',effet:'Cible −5 IA'},
      {n:'Lumière Sacrée',diff:15,pm:3,type:'S',dur:'10 min',effet:'Lumière ; −5 Discrétion créatures sensibles'},
      {n:'Bénédiction du Courage',diff:15,pm:3,type:'I',dur:'1 tour',effet:'+5 Sang-froid et Leadership'},
    ],
    utilitaires:[
      {n:'Stabilisation',diff:20,pm:6,type:'I',dur:'Instantané',effet:'Stabilise cible à 0 PV'},
      {n:'Bénir l\'Arme',diff:20,pm:6,type:'S',dur:'1 h',effet:'Arme +3 dégâts sacrés'},
      {n:'Sceau de Protection',diff:20,pm:6,type:'I',dur:'1 attaque',effet:'Réduction −5 prochaine attaque'},
      {n:'Charisme Lunaire',diff:20,pm:6,type:'S',dur:'1 h',effet:'+5 Persuasion, Intimidation, Représentation'},
      {n:'Inspiration Divine',diff:20,pm:6,type:'S',dur:'1 h',effet:'+5 Connaissance, Histoire, Arcanes'},
    ],
    tactiques:[
      {n:'Châtiment Mineur',diff:25,pm:8,type:'I',dur:'Instantané',effet:'2d6 dégâts sacrés (portée 15m)'},
      {n:'Guérison Profonde',diff:25,pm:8,type:'I',dur:'Instantané',effet:'Soigne 2d6+6 PV'},
      {n:'Vœu de Vérité',diff:25,pm:8,type:'S',dur:'2 min',effet:'Cible −10 Tromperie'},
      {n:'Aura des Fidèles',diff:25,pm:8,type:'C',dur:'3 tours',effet:'Alliés proches +5 IA ou +5 ID'},
      {n:'Psaume de Groupe',diff:25,pm:8,type:'S',dur:'5 min',effet:'Groupe +5 Sang-froid et Leadership'},
    ],
    signature:[
      {n:'Lance Divine',diff:30,pm:10,type:'I',dur:'Instantané',effet:'3d6 dégâts sacrés et −5 IA (portée 20m)'},
      {n:'Résurrection de l\'Élan',diff:30,pm:10,type:'I',dur:'Instantané',effet:'Cible à terre revient à 10 PV'},
      {n:'Jugement du Ciel',diff:35,pm:12,type:'I',dur:'Instantané',effet:'4d6 dégâts sacrés (portée 25m)'},
    ],
    rituels:[
      {n:'Prière de Rétablissement',diff:40,pm:10,pv:2,type:'R',incant:'15 min',dur:'Instantané',effet:'Soigne 3d6+6 PV'},
      {n:'Colonne de Foi',diff:70,pm:38,pv:5,type:'R',incant:'2 h',dur:'5 min',effet:'Groupe immunisé à la peur'},
    ]
  },
  ombres:{
    mineurs:[
      {n:'Diversion',diff:15,pm:3,type:'I',dur:'Instantané',effet:'Cible −5 Observation 1 tour'},
      {n:'Ombre',diff:15,pm:3,type:'S',dur:'3 tests',effet:'+5 Discrétion sur 3 jets'},
      {n:'Pas Feutrés',diff:15,pm:3,type:'C',dur:'1 min',effet:'+5 Discrétion déplacements'},
      {n:'Ombre sur le Visage',diff:15,pm:3,type:'S',dur:'10 min',effet:'+5 Tromperie, −5 Observation'},
      {n:'Serrure Chatouilleuse',diff:15,pm:3,type:'I',dur:'1 action',effet:'+5 Dextérité serrure simple'},
    ],
    utilitaires:[
      {n:'Regard Ailleurs',diff:20,pm:6,type:'I',dur:'1 tour',effet:'Cible −5 Observation contre action discrète'},
      {n:'Trace Effacée',diff:20,pm:6,type:'S',dur:'Instantané',effet:'−10 Pistage contre lanceur'},
      {n:'Mensonge Sans Trembler',diff:20,pm:6,type:'S',dur:'5 min',effet:'+5 Tromperie et Intimidation calme'},
      {n:'Poche Fantôme',diff:20,pm:6,type:'I',dur:'1 action',effet:'+5 Dextérité pour subtiliser objet'},
      {n:'Reflet Trompeur',diff:20,pm:6,type:'S',dur:'2 min',effet:'+5 Discrétion et Tromperie décor sombre'},
    ],
    tactiques:[
      {n:'Sournois',diff:25,pm:8,type:'I',dur:'1 attaque',effet:'Si cible ne voit pas : +5 dégâts'},
      {n:'Lame Muette',diff:25,pm:8,type:'S',dur:'1 min',effet:'Arme silencieuse ; +5 Discrétion attaque'},
      {n:'Vision Nocturne Volée',diff:25,pm:8,type:'C',dur:'10 min',effet:'Ignore pénombre ; +5 Observation'},
      {n:'Double d\'Ombre',diff:25,pm:8,type:'S',dur:'1 tour',effet:'Cible −5 Observation et −5 IA'},
      {n:'Fil du Voleur',diff:25,pm:8,type:'S',dur:'Instantané',effet:'Récupère objet léger à distance'},
    ],
    signature:[
      {n:'Bond d\'Ombre',diff:30,pm:10,type:'I',dur:'Instantané',effet:'Téléportation courte 5m ; +5 IA suivante'},
      {n:'Cauchemars',diff:35,pm:12,type:'S',dur:'3 tours',effet:'Cible −5 Sang-froid et −5 IA'},
      {n:'Assassinat Parfait',diff:35,pm:12,type:'I',dur:'1 attaque',effet:'Si surprise : +10 IA et +10 dégâts'},
      {n:'Brume',diff:30,pm:10,type:'C',dur:'3 tours',effet:'Zone : alliés +5 Discrétion, ennemis −5 Obs.'},
    ],
    rituels:[
      {n:'Voile du Visage',diff:40,pm:15,pv:2,type:'R',incant:'15 min',dur:'1 h',effet:'+10 Tromperie, −10 Observation pour être reconnu'},
      {n:'Brume d\'Infiltration',diff:75,pm:55,pv:6,type:'R',incant:'4 h',dur:'10 min',effet:'Zone : alliés +10 Discrétion, ennemis −5 IA'},
    ]
  },
  erudits:{
    mineurs:[
      {n:'Lecture Rapide',diff:15,pm:3,type:'I',dur:'Instantané',effet:'Comprend texte simple'},
      {n:'Analyse Brève',diff:15,pm:3,type:'I',dur:'Instantané',effet:'+5 à une compétence (1 action)'},
      {n:'Logique Immédiate',diff:15,pm:3,type:'I',dur:'Instantané',effet:'+10 Esprit au prochain jet'},
      {n:'Regard Savant',diff:15,pm:3,type:'S',dur:'1 min',effet:'+5 Observation au prochain jet'},
      {n:'Mémoire Claire',diff:15,pm:3,type:'S',dur:'Instantané',effet:'Rappel précis d\'une information'},
    ],
    utilitaires:[
      {n:'Analyse Tactique',diff:20,pm:6,type:'S',dur:'1 tour',effet:'+5 Initiative'},
      {n:'Lecture de Faiblesse',diff:20,pm:6,type:'S',dur:'1 tour',effet:'+5 IA contre cible'},
      {n:'Vision Magique',diff:20,pm:6,type:'S',dur:'1 min',effet:'Détecte magie (portée 20m)'},
      {n:'Déduction',diff:20,pm:6,type:'I',dur:'Instantané',effet:'Trouve une solution logique'},
      {n:'Clarté Mentale',diff:20,pm:6,type:'S',dur:'1 min',effet:'+5 Concentration'},
    ],
    tactiques:[
      {n:'Anticipation',diff:25,pm:8,type:'S',dur:'3 tours',effet:'+5 IA et ID'},
      {n:'Prédiction',diff:25,pm:8,type:'I',dur:'Instantané',effet:'Relance un jet'},
      {n:'Lecture du Combat',diff:25,pm:8,type:'S',dur:'3 tours',effet:'+5 Initiative groupe'},
      {n:'Dissipation Mineure',diff:25,pm:8,type:'I',dur:'Instantané',effet:'Annule un effet mineur'},
      {n:'Vision du Flux',diff:25,pm:8,type:'S',dur:'3 tours',effet:'Ignore −5 IA/ID situationnels'},
    ],
    signature:[
      {n:'Dissipation',diff:30,pm:10,type:'I',dur:'Instantané',effet:'Annule un sort actif (portée 20m)'},
      {n:'Clairvoyance',diff:30,pm:10,type:'S',dur:'1 min',effet:'Voit scène à distance ≤1 km'},
      {n:'Anticipation Totale',diff:35,pm:12,type:'S',dur:'12 h',effet:'Ne peut être surpris'},
      {n:'Analyse Absolue',diff:35,pm:12,type:'S',dur:'1 min',effet:'+5 IA, ID, Initiative'},
    ],
    rituels:[
      {n:'Vision Profonde',diff:50,pm:25,pv:4,type:'R',incant:'45 min',dur:'—',effet:'Voit une vérité cachée'},
      {n:'Vision du Futur',diff:70,pm:50,pv:8,type:'R',incant:'3 h',dur:'—',effet:'Aperçu d\'un événement probable'},
      {n:'Connaissance Absolue',diff:85,pm:80,pv:12,type:'R',incant:'Nuit',dur:'—',effet:'Réponse vraie à une question'},
    ]
  },
  creation:{
    mineurs:[
      {n:'Écho de l\'Esprit',diff:15,pm:3,type:'S',dur:'Instantané',effet:'Perçoit émotion d\'une gemme habitée'},
      {n:'Vernis de Conservation',diff:15,pm:3,type:'S',dur:'Permanent',effet:'Objet résiste à l\'usure ordinaire'},
      {n:'Cœur de Gemme',diff:15,pm:3,type:'S',dur:'1 min',effet:'Vérifie si gemme contient un esprit'},
      {n:'Sertissage Mineur',diff:15,pm:3,type:'S',dur:'Instantané',effet:'+5 Artisanat pour sertissage'},
      {n:'Marque de Fabricant',diff:15,pm:3,type:'S',dur:'Permanent',effet:'Signature magique sur un objet'},
    ],
    utilitaires:[
      {n:'Identification I',diff:20,pm:6,type:'S',dur:'Instantané',effet:'Objet magique ? +10 Arcanes'},
      {n:'Reliure de l\'Âme',diff:20,pm:6,type:'S',dur:'Permanent',effet:'Lie gemme à objet — réceptacle stable'},
      {n:'Bijou de Clarté',diff:20,pm:6,type:'S',dur:'Permanent',effet:'+5 Discipline mentale et Sang-froid'},
      {n:'Vision Funeste',diff:20,pm:6,type:'C',dur:'5 min',effet:'Voit esprits défunts récents'},
      {n:'Outil Sans Fin',diff:20,pm:6,type:'S',dur:'Permanent',effet:'Outil +5 à compétence associée'},
    ],
    tactiques:[
      {n:'Sceller un Esprit',diff:25,pm:8,type:'I',dur:'Instantané',effet:'Capture esprit récent en réserve'},
      {n:'Affûtage Spirituel',diff:25,pm:8,type:'S',dur:'Permanent',effet:'Arme sertie +3 dégâts'},
      {n:'Armature Fidèle',diff:25,pm:8,type:'S',dur:'Permanent',effet:'Armure sertie +5 ID, −1 malus gêne'},
      {n:'Consumer',diff:25,pm:8,type:'I',dur:'Instantané',effet:'Détruit esprit → relance pour cible'},
      {n:'Gemme Gardienne',diff:25,pm:8,type:'S',dur:'Permanent',effet:'Résiste vol (Discrétion Diff 30)'},
    ],
    signature:[
      {n:'Identification III',diff:30,pm:10,type:'S',dur:'Instantané',effet:'Révèle type esprit, rang, tendance'},
      {n:'Esprit de Lame',diff:30,pm:10,type:'S',dur:'Permanent',effet:'Arme liée +5 IA, 1 relance martiale/scène'},
      {n:'Forge de Combat',diff:35,pm:12,type:'S',dur:'Permanent',effet:'Arme magique +5 IA, +3 dégâts, 1 propriété'},
      {n:'Éclat Emprisonné',diff:30,pm:10,type:'S',dur:'Permanent',effet:'Objet à charge : 1d6 ou effet simple 1×/jour'},
    ],
    rituels:[
      {n:'Sertissage Sacré',diff:40,pm:15,pv:2,type:'R',incant:'20 min',dur:'Permanent',effet:'Objet devient réceptacle magique stable'},
      {n:'Armure de l\'Âme',diff:55,pm:30,pv:3,type:'R',incant:'1h30',dur:'Permanent',effet:'Armure liée +5 ID et −1 Fatigue/combat'},
      {n:'Forge Rituelle',diff:60,pm:35,pv:4,type:'R',incant:'2 h',dur:'Permanent',effet:'Objet magique avec 2 propriétés d\'esprit'},
    ]
  },
}

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
  const sorts = (SORTS[vKey] || SORTS.universelle)[activeCat] || []

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
        Cercle : <strong style={{color:'#FAC775'}}>{cercle.label}</strong> · {cercle.sorts} sorts disponibles · Score {score}
      </div>

      {/* Catégories */}
      <div style={{display:'flex',gap:5,flexWrap:'wrap' as const,marginBottom:8}}>
        {Object.keys(CAT_UNLOCK).map(cat => {
          const unlocked = score >= CAT_UNLOCK[cat]
          return (
            <button key={cat} onClick={() => unlocked && setActiveCat(cat)} style={{
              padding:'3px 10px',borderRadius:20,fontSize:10,cursor:unlocked?'pointer':'not-allowed',
              border:'none',opacity:unlocked?1:0.35,
              background: activeCat===cat ? '#534AB7' : '#221F35',
              color: activeCat===cat ? '#fff' : '#9B96B8',
              fontWeight: activeCat===cat ? 700 : 400,
            }}>
              {CAT_LABELS[cat]}
            </button>
          )
        })}
      </div>

      {/* Liste sorts */}
      <div style={{display:'flex',flexDirection:'column' as const,gap:5}}>
        {sorts.map((s: any) => (
          <div key={s.n} style={{background:'#221F35',borderRadius:6,padding:'8px 10px'}}>
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3,flexWrap:'wrap' as const}}>
              <span style={{fontSize:12,fontWeight:600,color:'#E8E6F0',flex:1}}>{s.n}</span>
              <span style={{fontSize:10,padding:'2px 6px',borderRadius:8,background:TYPE_COLORS[s.type],color:TYPE_TEXT[s.type]}}>{TYPE_LABELS[s.type]}</span>
              <span style={{fontSize:10,padding:'2px 6px',borderRadius:8,background:'rgba(127,119,221,.15)',color:'#A29BFE'}}>Diff {s.diff}</span>
              <span style={{fontSize:10,padding:'2px 6px',borderRadius:8,background:'rgba(74,158,224,.15)',color:'#4A9EE0'}}>{s.pm} PM{s.pv?` · ${s.pv} PV`:''}</span>
              <span style={{fontSize:10,padding:'2px 6px',borderRadius:8,background:'rgba(250,199,117,.1)',color:'#FAC775'}}>{s.dur}</span>
              {s.incant && <span style={{fontSize:10,padding:'2px 6px',borderRadius:8,background:'#1A1828',color:'#6B6589'}}>⏱ {s.incant}</span>}
            </div>
            <div style={{fontSize:11,color:'#9B96B8'}}>{s.effet}</div>
          </div>
        ))}
        {sorts.length === 0 && (
          <div style={{fontSize:12,color:'#6B6589',textAlign:'center' as const,padding:'1rem'}}>
            Aucun sort dans cette catégorie.
          </div>
        )}
      </div>

      <div style={{fontSize:10,color:'#6B6589',marginTop:8,padding:'5px 8px',background:'rgba(127,119,221,.05)',borderRadius:6}}>
        ⚠ Sorts normalement attribués par Vaela/MJ · 1 seul Rituel actif · 1 seul Instantané/tour · PM perdus sur échec · Seuil = Voix + Esprit − Diff
      </div>
    </div>
  )
}

