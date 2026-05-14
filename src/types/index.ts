// ─── Types de données du personnage ─────────────────────────────────────────

export type Stat = 'Corps' | 'Agilité' | 'Esprit' | 'Volonté' | 'Présence' | 'Perception'

export interface PersonnageData {
  // Étape 1 — Race
  raceId: string
  raceName: string
  humanStatPicks: Stat[]

  // Étape 2 — Stats
  baseStats: Record<Stat, number>
  finalStats: Record<Stat, number>

  // Étape 3 — Compétences
  majorSkills: string[]
  minorSkills: string[]

  // Étape 4 — Avantages/Désavantages
  pairs: AdvDisPair[]

  // Étape 5 — Voix
  voiceId: string
  voiceName: string
  vUniv: number
  vSpec: number

  // Étape 6 — Équipement
  weaponName: string | null
  armorName: string | null
  shieldName: string | null
  inventory: InventoryItem[]
  bourse: { SO: number; CA: number; DC: number }

  // Étape 7 — Identité
  nom: string
  concept: string
  origine: string
  intention: string
  faction: string
  relations: string
  bio: string

  // Calculés
  pv: number
  pm: number
  initBase: number
  renommee: number
  ia: number
  id_: number
}

export interface AdvDisPair {
  level: 'l' | 'i' | 'e'
  levelLabel: string
  adv: { n: string; e: string }
  dis: { roll: number; n: string; d: string }
}

export interface InventoryItem {
  n: string
  qty: number
}

// ─── Types Supabase ──────────────────────────────────────────────────────────

export interface Personnage {
  id: string
  user_id: string
  nom: string
  race: string
  data: PersonnageData
  share_token: string
  is_public: boolean
  role_mj: boolean   // true si ce personnage est un MJ qui peut voir les autres
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  display_name: string
  is_mj: boolean
  created_at: string
}

// ─── Types UI ────────────────────────────────────────────────────────────────

export interface WizardState extends PersonnageData {
  step: number
}
