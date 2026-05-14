-- ═══════════════════════════════════════════════════════════════════
-- PARTITURA — Schéma Supabase
-- Coller dans : Supabase Dashboard → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════════════

-- Extension pour générer des UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── TABLE : profiles ────────────────────────────────────────────────────────
-- Étend les utilisateurs Supabase Auth avec des infos supplémentaires
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  display_name TEXT,
  is_mj       BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger : crée automatiquement un profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    SPLIT_PART(NEW.email, '@', 1)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── TABLE : personnages ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.personnages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nom          TEXT NOT NULL DEFAULT 'Personnage sans nom',
  race         TEXT NOT NULL DEFAULT '',
  data         JSONB NOT NULL DEFAULT '{}',   -- Tout le state du wizard
  share_token  TEXT UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'), -- Lien partage MJ
  is_public    BOOLEAN DEFAULT FALSE,         -- Visible dans dashboard MJ
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_personnages_user_id ON public.personnages(user_id);
CREATE INDEX IF NOT EXISTS idx_personnages_share_token ON public.personnages(share_token);
CREATE INDEX IF NOT EXISTS idx_personnages_is_public ON public.personnages(is_public);

-- Trigger : met à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.personnages;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.personnages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ─── ROW LEVEL SECURITY (RLS) ─────────────────────────────────────────────────
-- Chaque joueur ne voit QUE ses propres personnages, sauf si partagés

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personnages ENABLE ROW LEVEL SECURITY;

-- Profiles : chacun voit et modifie uniquement le sien
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Personnages : CRUD complet sur ses propres personnages
CREATE POLICY "personnages_select_own" ON public.personnages
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "personnages_insert_own" ON public.personnages
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "personnages_update_own" ON public.personnages
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "personnages_delete_own" ON public.personnages
  FOR DELETE USING (auth.uid() = user_id);

-- Partage public : tout le monde peut lire les fiches publiques (dashboard MJ)
CREATE POLICY "personnages_select_public" ON public.personnages
  FOR SELECT USING (is_public = TRUE);

-- Partage par token : accessible via share_token même sans être connecté
CREATE POLICY "personnages_select_by_token" ON public.personnages
  FOR SELECT USING (share_token IS NOT NULL);

-- ─── VÉRIFICATION ─────────────────────────────────────────────────────────────
-- Lance ces requêtes pour vérifier que tout est OK :
-- SELECT * FROM public.profiles LIMIT 5;
-- SELECT id, nom, race, share_token, is_public FROM public.personnages LIMIT 5;
