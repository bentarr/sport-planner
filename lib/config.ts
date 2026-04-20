export type SessionType = 'circuit1' | 'circuit2' | 'circuit3' | 'insanity' | 'rest' | 'custom'

export interface SessionConfig {
  label: string
  sub: string
  color: string        // Tailwind bg class
  textColor: string    // Tailwind text class
  borderColor: string
}

export const SESSION_CONFIGS: Record<SessionType, SessionConfig> = {
  circuit1: {
    label: 'Circuit 1',
    sub: 'Park Master',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-400',
  },
  circuit2: {
    label: 'Circuit 2',
    sub: 'Sculpt & Burn',
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-400',
  },
  circuit3: {
    label: 'Circuit 3',
    sub: 'Freeride',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-400',
  },
  insanity: {
    label: 'Insanity',
    sub: 'Cardio pur',
    color: 'bg-red-500',
    textColor: 'text-red-700',
    borderColor: 'border-red-400',
  },
  rest: {
    label: 'Repos / Vélo / Marche',
    sub: 'Récupération',
    color: 'bg-gray-400',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-300',
  },
  custom: {
    label: 'Libre',
    sub: '',
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-400',
  },
}

// Lundi=0 → Dimanche=6 (iso weekday - 1)
export const WEEKLY_PLAN: SessionType[] = [
  'circuit1',  // Lundi
  'insanity',  // Mardi
  'circuit2',  // Mercredi
  'rest',      // Jeudi
  'circuit3',  // Vendredi
  'insanity',  // Samedi
  'rest',      // Dimanche
]

// Surcharges pour la phase de démarrage
export const SPECIAL_DAYS: Record<string, { type: SessionType; label: string; done?: boolean }> = {
  '2026-04-17': { type: 'circuit2', label: 'Mise en route ✓', done: true },
  '2026-04-18': { type: 'insanity', label: 'Fit Test Insanity' },
  '2026-04-19': { type: 'rest',     label: 'Repos / Vélo / Marche' },
}

export const PROGRAMME_START = new Date(2026, 3, 20) // 20 avril 2026

export const CIRCUITS = {
  circuit1: {
    name: 'Park Master',
    focus: 'Agilité · Explosivité · Sauts freestyle',
    exercises: [
      { name: 'Skater Jumps', tip: 'Bond latéral d\'un pied sur l\'autre. Reste bas !' },
      { name: 'Pompes "T"', tip: 'Pompe + rotation buste, bras vers le plafond.' },
      { name: 'Fentes Sautées', tip: 'Change de jambe dans les airs. Explosion !' },
      { name: 'Planche Commando', tip: 'Coudes → mains → coudes. Fessiers serrés.' },
      { name: 'Burpees', tip: 'Sol → saut. Amortis bien la réception.' },
      { name: 'Montées de genoux "Sprint" 🔥', tip: 'FINISHER — Le plus vite possible. Buste droit.' },
    ],
  },
  circuit2: {
    name: 'Sculpt & Burn',
    focus: 'Poitrine · Taille · Poignées d\'amour',
    exercises: [
      { name: 'Pompes Mains Larges', tip: 'Mains au-delà des épaules. Contracte les pectoraux.' },
      { name: 'Spider Climbers ★', tip: 'Planche haute : genou vers l\'extérieur du coude. Ne lève pas les fesses !' },
      { name: 'Plank Skiers ★', tip: 'Planche haute : saute pieds joints droite → gauche. Silencieux = efficace.' },
      { name: 'Dips sur chaise', tip: 'Dos à la chaise. Garde le dos collé : protège les épaules.' },
      { name: 'Planche Latérale / Hip Dips', tip: '20s par côté. Hanche vers le plafond.' },
      { name: 'Mountain Climbers 🔥', tip: 'FINISHER ✅ — Abdos sous tension + cardio = radical.' },
    ],
  },
  circuit3: {
    name: 'Freeride Endurance',
    focus: 'Cuisses · Dos · Réceptions · Latéralité',
    exercises: [
      { name: 'La Chaise (Wall Sit)', tip: 'Dos au mur, cuisses à 90°. Simule les longues descentes.' },
      { name: 'Squats Sumo', tip: 'Pieds très larges, pointes vers l\'ext. Intérieur des cuisses.' },
      { name: 'Montées de genoux', tip: 'Sprint sur place. Cardio max.' },
      { name: 'Superman', tip: 'Ventre au sol : décolle buste + jambes. Protège les lombaires.' },
      { name: 'Sauts Groupés (Tuck Jumps)', tip: 'Ramène les genoux à la poitrine. Futur 360° !' },
      { name: 'Sauts Latéraux 🔥', tip: 'FINISHER — Pieds joints, saute une ligne au sol D→G. Virages en bosses !' },
    ],
  },
}
