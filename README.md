# 🎿 Sport Planner — Objectif 80kg & Freestyle

Application web full-stack responsive pour suivre tes séances, cocher les jours, suivre ton poids et consulter tes circuits HIIT.

## Stack
- **Next.js 14** (App Router) — framework + API routes
- **Supabase** — auth (Google / email) + PostgreSQL + RLS
- **Tailwind CSS** — responsive mobile-first
- **Vercel** — déploiement automatique via GitHub

---

## 🚀 Déploiement en 4 étapes

### 1. Supabase (BDD + Auth)

1. Va sur [supabase.com](https://supabase.com) → créer un projet (gratuit)
2. Dans **SQL Editor** → colle tout le contenu de `supabase/schema.sql` → Run
3. Dans **Authentication → Providers** → activer **Google**
   - Crée un projet sur [console.cloud.google.com](https://console.cloud.google.com)
   - APIs → OAuth 2.0 → Client ID (type Web Application)
   - Redirect URI : `https://xxxx.supabase.co/auth/v1/callback`
   - Copie Client ID + Secret dans Supabase
4. Dans **Project Settings → API** → copie :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. GitHub

```bash
git init
git add .
git commit -m "init sport planner"
git remote add origin https://github.com/TON_USERNAME/sport-planner.git
git push -u origin main
```

### 3. Vercel

1. Va sur [vercel.com](https://vercel.com) → **New Project** → importer depuis GitHub
2. Dans **Environment Variables**, ajoute :
   ```
   NEXT_PUBLIC_SUPABASE_URL     = https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGci...
   ```
3. **Deploy** → Vercel te donne une URL (ex: `sport-planner-paul.vercel.app`)

### 4. Configurer le redirect OAuth

Dans Supabase → **Authentication → URL Configuration** :
- Site URL : `https://sport-planner-paul.vercel.app`
- Redirect URLs : `https://sport-planner-paul.vercel.app/**`

Dans Google Cloud Console → OAuth → Redirect URIs :
- Ajouter : `https://xxxx.supabase.co/auth/v1/callback`

---

## 🛠 Dev local

```bash
npm install
cp .env.example .env.local
# Remplis .env.local avec tes clés Supabase
npm run dev
# → http://localhost:3000
```

---

## Fonctionnalités

- ✅ Login Google ou lien magique par email
- ✅ Calendrier mensuel avec séances pré-remplies (ton planning)
- ✅ Cocher une séance = sauvegardé en base instantanément
- ✅ Jauge d'intensité (1-5) par jour
- ✅ Note par séance
- ✅ Suivi du poids (historique)
- ✅ Stats : séances faites / objectif, poids actuel, kg restant
- ✅ Modal de référence des 3 circuits (avec finishers)
- ✅ Navigation entre mois
- ✅ Imprimable (A4 paysage)
- ✅ 100% responsive mobile
- ✅ Données privées (RLS Supabase — chaque user voit seulement ses données)

## Structure

```
app/
  page.tsx              → Login
  dashboard/page.tsx    → Calendrier + stats
  api/sessions/route.ts → CRUD séances
  api/weight/route.ts   → CRUD poids
components/
  DayCell.tsx           → Cellule de jour
  StatsBar.tsx          → Barre de stats
  CircuitModal.tsx      → Modal référence circuits
lib/
  supabase.ts           → Client Supabase
  config.ts             → Planning, circuits, couleurs
supabase/
  schema.sql            → Tables + RLS
```
