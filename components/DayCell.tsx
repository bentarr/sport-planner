'use client'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { SESSION_CONFIGS, SessionType } from '@/lib/config'
import clsx from 'clsx'

interface Session {
  id?: string
  date: string
  type: SessionType
  label?: string
  done: boolean
  intensity?: number
  note?: string
  calories?: number
}

interface Props {
  date: Date
  session: { type: SessionType; label: string; done?: boolean }
  savedSession?: Session
  isToday: boolean
  isPast: boolean
  onToggleDone: (date: string, done: boolean) => Promise<void>
  onIntensity: (date: string, intensity: number) => Promise<void>
  onNote: (date: string, note: string) => Promise<void>
  onCalories: (date: string, calories: number) => Promise<void>
}

export default function DayCell({ date, session, savedSession, isToday, isPast, onToggleDone, onIntensity, onNote, onCalories }: Props) {
  const cfg = SESSION_CONFIGS[session.type]
  const dateStr = format(date, 'yyyy-MM-dd')
  const dayNum = date.getDate()

  const [localDone, setLocalDone] = useState(savedSession?.done ?? false)
  const [localIntensity, setLocalIntensity] = useState(savedSession?.intensity ?? 0)
  const [localNote, setLocalNote] = useState(savedSession?.note ?? '')
  const [localCalories, setLocalCalories] = useState(savedSession?.calories?.toString() ?? '')

  useEffect(() => { setLocalDone(savedSession?.done ?? false) }, [savedSession?.done])
  useEffect(() => { setLocalIntensity(savedSession?.intensity ?? 0) }, [savedSession?.intensity])
  useEffect(() => { setLocalNote(savedSession?.note ?? '') }, [savedSession?.note])
  useEffect(() => { setLocalCalories(savedSession?.calories?.toString() ?? '') }, [savedSession?.calories])

  if (isPast) {
    return (
      <div className="border-r border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] opacity-40 min-h-[180px] p-2">
        <span className="font-bebas text-lg text-gray-400 dark:text-white/30">{dayNum}</span>
      </div>
    )
  }

  function handleToggle() {
    const newDone = !localDone
    setLocalDone(newDone)
    onToggleDone(dateStr, newDone)
  }

  function handleIntensity(val: number) {
    const newVal = val === localIntensity ? 0 : val
    setLocalIntensity(newVal)
    onIntensity(dateStr, newVal)
  }

  function handleNoteBlur() {
    if (localNote !== (savedSession?.note ?? '')) onNote(dateStr, localNote)
  }

  function handleCaloriesBlur() {
    const val = parseInt(localCalories)
    const saved = savedSession?.calories ?? 0
    if (!isNaN(val) && val !== saved) onCalories(dateStr, val)
    else if (localCalories === '' && saved > 0) onCalories(dateStr, 0)
  }

  const hasCalories = localCalories !== '' && localCalories !== '0'
  const hasNote = localNote.trim() !== ''

  return (
    <div className={clsx(
      'border-r border-b border-gray-200 dark:border-white/5 min-h-[180px] p-2 flex flex-col gap-1.5 relative transition-colors',
      localDone
        ? 'bg-lime/20 dark:bg-lime/10'
        : isToday
        ? 'bg-yellow-50 dark:bg-yellow-400/10'
        : session.type === 'rest'
        ? 'bg-gray-50 dark:bg-white/[0.03]'
        : 'bg-white dark:bg-[#111e33]',
    )}>
      <span className={clsx('font-bebas text-xl leading-none', isToday ? 'text-lime2' : 'text-navy/70 dark:text-white/60')}>
        {dayNum}
      </span>

      <button
        onClick={handleToggle}
        className={clsx(
          'absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
          localDone ? 'bg-lime border-lime2' : 'border-gray-300 dark:border-white/20 bg-transparent hover:border-lime2'
        )}
      >
        {localDone && (
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#0B1628" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      <span className={clsx('text-[9px] font-bold uppercase tracking-wide text-white px-1.5 py-0.5 rounded w-fit leading-tight', cfg.color)}>
        {session.label || cfg.label}
      </span>

      {session.type !== 'rest' && (
        <div className="flex items-center gap-1">
          <span className="text-[8px] text-gray-300 dark:text-white/25 mr-0.5">intensité</span>
          {[1,2,3,4,5].map(n => (
            <button
              key={n}
              onClick={() => handleIntensity(n)}
              className={clsx('w-2 h-2 rounded-full transition-colors', n <= localIntensity ? 'bg-lime2' : 'bg-gray-200 dark:bg-white/10 hover:bg-gray-300')}
            />
          ))}
        </div>
      )}

      {session.type !== 'rest' && (
        <div className={clsx(
          'flex items-center gap-1 rounded-md px-1.5 py-1 transition-colors',
          hasCalories
            ? 'bg-orange-50 dark:bg-orange-400/10 border border-orange-200 dark:border-orange-400/20'
            : 'bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5'
        )}>
          <span className="text-[10px] leading-none">🔥</span>
          <input
            type="number"
            min="0"
            max="9999"
            placeholder="—"
            value={localCalories}
            onChange={e => setLocalCalories(e.target.value)}
            onBlur={handleCaloriesBlur}
            className={clsx(
              'w-10 text-[9px] bg-transparent outline-none font-mono',
              hasCalories ? 'text-orange-700 dark:text-orange-300' : 'text-gray-400 dark:text-white/30 placeholder:text-gray-300'
            )}
          />
          <span className={clsx('text-[8px]', hasCalories ? 'text-orange-400 dark:text-orange-400/70' : 'text-gray-300 dark:text-white/20')}>kcal</span>
        </div>
      )}

      <input
        className={clsx(
          'text-[9px] w-full px-1.5 py-1 rounded-md outline-none placeholder:text-gray-300 dark:placeholder:text-white/20 transition-all mt-auto',
          hasNote
            ? 'bg-navy/5 dark:bg-white/10 border border-navy/10 dark:border-white/10 text-navy dark:text-white/80 focus:border-lime2/50'
            : 'bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-navy dark:text-white/80 focus:bg-white dark:focus:bg-white/10 focus:border-lime2/50'
        )}
        placeholder="✏️ note..."
        value={localNote}
        onChange={e => setLocalNote(e.target.value)}
        onBlur={handleNoteBlur}
      />
    </div>
  )
}
