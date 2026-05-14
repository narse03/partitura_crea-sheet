# PARTITURA — App de création de personnage

## Stack
- **Next.js 14** (App Router)
- **Supabase** (Auth + PostgreSQL + RLS)
- **Vercel** (hébergement)
- **Tailwind CSS** + thème Partitura

---

## 🚀 Installation — 3 plateformes en 15 minutes

### 1. SUPABASE — Base de données

1. Va sur [supabase.com](https://supabase.com) → ton projet
2. **SQL Editor** → **New Query**
3. Colle le contenu de `supabase_schema.sql` → **Run**
4. Vérifie dans **Table Editor** que les tables `profiles` et `personnages` existent
5. Dans **Settings → Authentication** :
   - Active **Email** comme provider
   - Optionnel : configure l'URL de redirection email → `https://TON-DOMAINE.vercel.app/auth/callback`

---

### 2. GITHUB — Dépôt de code

```bash
# Dans ton terminal, dans le dossier partitura-app :

git init
git add .
git commit -m "Initial commit — Partitura app"

# Sur github.com : créer un nouveau repo "partitura-app" (sans README)
# Puis :
git remote add origin https://github.com/TON_USERNAME/partitura-app.git
git branch -M main
git push -u origin main
```

**Important** : vérifie que `.env.local` n'est PAS dans le commit (`git status` ne doit pas le montrer).

---

### 3. VERCEL — Déploiement

1. Va sur [vercel.com](https://vercel.com) → **Add New Project**
2. **Import** ton repo GitHub `partitura-app`
3. Dans **Environment Variables**, ajoute :

| Nom | Valeur |
|-----|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://uiaoqkkefjwgvstuuube.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` (ta clé anon) |
| `SUPABASE_SERVICE_ROLE_KEY` | (ta service_role key depuis Settings → API) |

4. **Deploy** → Vercel build et déploie automatiquement
5. Copie l'URL Vercel (ex: `partitura-app.vercel.app`)
6. **Retourne dans Supabase** → Settings → Authentication → Site URL → mets l'URL Vercel

---

## 🔄 Déploiement continu

Chaque `git push` sur `main` redéploie automatiquement sur Vercel.

```bash
# Workflow normal de développement :
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push
# → Vercel déploie automatiquement en ~1 minute
```

---

## 📁 Structure du projet

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Layout racine
│   ├── globals.css           # Thème Partitura
│   ├── auth/
│   │   ├── login/page.tsx    # Connexion / inscription
│   │   └── callback/route.ts # Callback email
│   ├── creation/page.tsx     # Wizard de création (à connecter)
│   ├── personnages/page.tsx  # Liste des personnages
│   ├── fiche/[id]/page.tsx  # Fiche partageable
│   └── mj/dashboard/page.tsx # Dashboard MJ
├── components/
│   ├── ui/
│   │   └── LogoutButton.tsx  # Boutons réutilisables
│   └── fiche/
│       └── ExportPDFButton.tsx # Export PDF
├── lib/
│   └── supabase/
│       ├── client.ts         # Client navigateur
│       └── server.ts         # Client serveur
├── middleware.ts              # Protection des routes
└── types/index.ts            # Types TypeScript
```

---

## 🔐 Sécurité

- `.env.local` jamais commité (dans `.gitignore`)
- `SUPABASE_SERVICE_ROLE_KEY` seulement dans Vercel env vars
- RLS Supabase : chaque joueur ne voit que ses données
- Fiches partagées uniquement par token opaque (pas l'UUID)

---

## 📋 Prochaines étapes

- [ ] Connecter le wizard HTML existant à Supabase (save/load)
- [ ] Page `/creation` avec sauvegarde automatique
- [ ] Bouton "Partager avec mon MJ" sur la fiche
- [ ] Notifications quand un joueur partage une fiche
