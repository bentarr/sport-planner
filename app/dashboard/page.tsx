'use client'
import { useState, useEffect, useCallback } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'
import { createClient } from '@/lib/supabase'
import { WEEKLY_PLAN, SPECIAL_DAYS, PROGRAMME_START, SESSION_CONFIGS, SessionType } from '@/lib/config'
import DayCell from '@/components/DayCell'
import StatsBar from '@/components/StatsBar'
import CircuitModal from '@/components/CircuitModal'
import WeightHistory from '@/components/WeightHistory'
import { useRouter } from 'next/navigation'

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

interface DbSession {
  id: string
  date: string
  type: SessionType
  label?: string
  done: boolean
  intensity?: number
  note?: string
  calories?: number
}

function getSessionForDate(date: Date) {
  const key = format(date, 'yyyy-MM-dd')
  if (SPECIAL_DAYS[key]) return SPECIAL_DAYS[key]
  if (date < PROGRAMME_START) return null
  const dow = getDay(date) // 0=Sun
  const isoMon = dow === 0 ? 6 : dow - 1 // 0=Mon
  const type = WEEKLY_PLAN[isoMon]
  const cfg = SESSION_CONFIGS[type]
  return { type, label: cfg.label }
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [savedSessions, setSavedSessions] = useState<DbSession[]>([])
  const [weights, setWeights] = useState<{date:string; weight_kg:number}[]>([])
  const [showCircuits, setShowCircuits] = useState(false)
  const [showWeightHistory, setShowWeightHistory] = useState(false)
  const [showWeightInput, setShowWeightInput] = useState(false)
  const [newWeight, setNewWeight] = useState('')
  const [weightDate, setWeightDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [user, setUser] = useState<{email?:string; user_metadata?: {full_name?: string}} | null>(null)

  const year  = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  // Auth check
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/'); return }
      setUser(data.user as any)
    })
  }, [])

  // Load sessions
  const loadSessions = useCallback(async () => {
    const res = await fetch(`/api/sessions?year=${year}&month=${month}`)
    if (res.ok) setSavedSessions(await res.json())
  }, [year, month])

  // Load weights
  const loadWeights = useCallback(async () => {
    const res = await fetch('/api/weight')
    if (res.ok) setWeights(await res.json())
  }, [])

  useEffect(() => { loadSessions() }, [loadSessions])
  useEffect(() => { loadWeights() }, [loadWeights])

  // Calendar days
  const firstDay = startOfMonth(currentDate)
  const lastDay  = endOfMonth(currentDate)
  const days     = eachDayOfInterval({ start: firstDay, end: lastDay })
  const startOffset = (() => { const d = getDay(firstDay); return d === 0 ? 6 : d - 1 })()
  const today = new Date()

  // Stats
  const doneSessions  = savedSessions.filter(s => s.done).length
  const totalCalories = savedSessions.reduce((sum, s) => sum + (s.calories ?? 0), 0)
  const latestWeight  = weights.slice().sort((a, b) => b.date.localeCompare(a.date))[0]?.weight_kg
  const START_DATE    = new Date(2026, 3, 17)

  function getDbSession(date: Date) {
    const key = format(date, 'yyyy-MM-dd')
    return savedSessions.find(s => s.date === key)
  }

  async function handleToggleDone(dateStr: string, done: boolean) {
    const existing = savedSessions.find(s => s.date === dateStr)
    const session  = getSessionForDate(new Date(dateStr))
    if (!session) return

    if (existing) {
      const res = await fetch('/api/sessions', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: existing.id, done }) })
      if (res.ok) { const updated = await res.json(); setSavedSessions(prev => prev.map(s => s.id === updated.id ? updated : s)) }
    } else {
      const res = await fetch('/api/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: dateStr, type: session.type, label: session.label, done }) })
      if (res.ok) { const created = await res.json(); setSavedSessions(prev => [...prev, created]) }
    }
  }

  async function handleIntensity(dateStr: string, intensity: number) {
    const existing = savedSessions.find(s => s.date === dateStr)
    const session  = getSessionForDate(new Date(dateStr))
    if (!session) return

    if (existing) {
      const res = await fetch('/api/sessions', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: existing.id, intensity }) })
      if (res.ok) { const updated = await res.json(); setSavedSessions(prev => prev.map(s => s.id === updated.id ? updated : s)) }
    } else {
      const res = await fetch('/api/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: dateStr, type: session.type, label: session.label, done: false, intensity }) })
      if (res.ok) { const created = await res.json(); setSavedSessions(prev => [...prev, created]) }
    }
  }

  async function handleNote(dateStr: string, note: string) {
    const existing = savedSessions.find(s => s.date === dateStr)
    const session  = getSessionForDate(new Date(dateStr))
    if (!session) return

    if (existing) {
      await fetch('/api/sessions', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: existing.id, note }) })
      setSavedSessions(prev => prev.map(s => s.date === dateStr ? { ...s, note } : s))
    } else {
      const res = await fetch('/api/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: dateStr, type: session.type, done: false, note }) })
      if (res.ok) { const created = await res.json(); setSavedSessions(prev => [...prev, created]) }
    }
  }

  async function handleAddWeight() {
    const kg = parseFloat(newWeight.replace(',', '.'))
    if (isNaN(kg)) return
    const res = await fetch('/api/weight', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: weightDate, weight_kg: kg })
    })
    if (res.ok) { await loadWeights(); setShowWeightInput(false); setNewWeight(''); setWeightDate(format(new Date(), 'yyyy-MM-dd')) }
  }

  async function handleCalories(dateStr: string, calories: number) {
    const existing = savedSessions.find(s => s.date === dateStr)
    const session  = getSessionForDate(new Date(dateStr))
    if (!session) return
    if (existing) {
      const res = await fetch('/api/sessions', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: existing.id, calories }) })
      if (res.ok) { const updated = await res.json(); setSavedSessions(prev => prev.map(s => s.id === updated.id ? updated : s)) }
    } else {
      const res = await fetch('/api/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: dateStr, type: session.type, label: session.label, done: false, calories }) })
      if (res.ok) { const created = await res.json(); setSavedSessions(prev => [...prev, created]) }
    }
  }

  async function handleDeleteWeight(id: string) {
    await fetch('/api/weight', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setWeights(prev => prev.filter(w => w.id !== id))
  }

  async function handleEditWeight(id: string, weight_kg: number) {
    const res = await fetch('/api/weight', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, weight_kg }) })
    if (res.ok) { const updated = await res.json(); setWeights(prev => prev.map(w => w.id === updated.id ? updated : w)) }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <nav className="bg-[#0B1628] px-4 sm:px-6 py-3 flex items-center justify-between no-print">
        <div>
          <p className="text-lime text-[9px] tracking-widest font-mono-dm uppercase">Sport Planner</p>
          <p className="text-white font-bebas text-xl leading-none">
            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Athlete'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCircuits(true)}
            className="bg-lime text-navy text-xs font-bold px-3 py-1.5 rounded-lg hover:opacity-90 transition"
          >
            Circuits 📋
          </button>
          <button
            onClick={() => setShowWeightHistory(true)}
            className="bg-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-white/20 transition"
          >
            📈
          </button>
          <button
            onClick={() => setShowWeightInput(v => !v)}
            className="bg-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-white/20 transition"
          >
            + Poids
          </button>
          <button onClick={handleSignOut} className="text-white/30 hover:text-white/60 text-xs transition">
            Déco
          </button>
        </div>
      </nav>

      {/* Weight quick-add */}
      {showWeightInput && (
        <div className="bg-[#132038] px-4 sm:px-6 py-2 flex flex-wrap items-center gap-3 no-print">
          <span className="text-white/50 text-xs">Poids :</span>
          <input
            type="date"
            value={weightDate}
            onChange={e => setWeightDate(e.target.value)}
            className="bg-white/10 text-white text-sm px-3 py-1 rounded-lg outline-none focus:ring-1 focus:ring-lime"
          />
          <input
            type="number"
            step="0.1"
            min="40" max="200"
            placeholder="88.8"
            value={newWeight}
            onChange={e => setNewWeight(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddWeight()}
            className="bg-white/10 text-white text-sm px-3 py-1 rounded-lg outline-none w-24 focus:ring-1 focus:ring-lime"
          />
          <span className="text-white/30 text-xs">kg</span>
          <button onClick={handleAddWeight} className="bg-lime text-navy text-xs font-bold px-3 py-1 rounded-lg">
            Enregistrer
          </button>
        </div>
      )}

      {/* Stats bar */}
      <StatsBar
        doneSessions={doneSessions}
        goalSessions={16}
        latestWeight={latestWeight}
        goalWeight={78}
        totalCalories={totalCalories}
      />

      {/* Calendar header */}
      <div className="bg-[#0B1628] px-4 sm:px-8 py-4 flex items-end justify-between">
        <div>
          <p className="text-lime/60 text-[9px] tracking-widest font-mono-dm uppercase">
            Objectif Ski &amp; Freestyle
          </p>
          <h1 className="font-bebas text-5xl sm:text-6xl text-white leading-none">
            {MONTHS_FR[currentDate.getMonth()]}
            <span className="text-white/25 text-2xl ml-2">{year}</span>
          </h1>
        </div>
        <div className="flex gap-2 no-print">
          <button onClick={() => setCurrentDate(d => subMonths(d, 1))} className="bg-white/10 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-white/20 transition">◂</button>
          <button onClick={() => setCurrentDate(new Date())} className="bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-white/20 transition">Auj.</button>
          <button onClick={() => setCurrentDate(d => addMonths(d, 1))} className="bg-white/10 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-white/20 transition">▸</button>
          <button onClick={() => window.print()} className="bg-lime text-navy px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition">🖨</button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 bg-[#132038]">
        {WEEKDAYS.map((d, i) => (
          <div key={d} className={`text-center py-2 text-[9px] font-semibold tracking-widest uppercase ${i >= 5 ? 'text-lime/60' : 'text-white/35'}`}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 bg-white">
        <div className="grid grid-cols-7 border-l border-t border-gray-200">
          {/* Empty offset cells */}
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`offset-${i}`} className="border-r border-b border-gray-200 bg-gray-50 min-h-[100px] sm:min-h-[120px]"/>
          ))}

          {/* Day cells */}
          {days.map(day => {
            const session = getSessionForDate(day)
            const isPast  = day < START_DATE
            const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')

            if (!session && !isPast) {
              return (
                <div key={day.toString()} className="border-r border-b border-gray-200 bg-gray-50/60 min-h-[100px] sm:min-h-[120px] p-2 opacity-50">
                  <span className="font-bebas text-lg text-gray-300">{day.getDate()}</span>
                </div>
              )
            }

            return (
              <DayCell
                key={day.toString()}
                date={day}
                session={session || { type: 'rest', label: 'Repos' }}
                savedSession={getDbSession(day)}
                isToday={isToday}
                isPast={isPast}
                onToggleDone={handleToggleDone}
                onIntensity={handleIntensity}
                onNote={handleNote}
                onCalories={handleCalories}
              />
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-[#0B1628] px-4 sm:px-8 py-3 flex flex-wrap gap-3 no-print">
        {(Object.entries(SESSION_CONFIGS) as [SessionType, typeof SESSION_CONFIGS[SessionType]][]).map(([type, cfg]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${cfg.color}`}/>
            <span className="text-[9px] text-white/40">{cfg.label}</span>
          </div>
        ))}
      </div>

      <CircuitModal open={showCircuits} onClose={() => setShowCircuits(false)} />
      <WeightHistory open={showWeightHistory} onClose={() => setShowWeightHistory(false)} weights={weights} goalWeight={78} onDelete={handleDeleteWeight} onEdit={handleEditWeight} />
    </div>
  )
}
