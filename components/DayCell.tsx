'use client'
import { useState } from 'react'
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
}

interface Props {
  date: Date
  session: { type: SessionType; label: string; done?: boolean }
  savedSession?: Session
  isToday: boolean
  isPast: boolean   // avant le 17 avril
  onToggleDone: (date: string, done: boolean) => Promise<void>
  onIntensity: (date: string, intensity: number) => Promise<void>
  onNote: (date: string, note: string) => Promise<void>
}

export default function DayCell({ date, session, savedSession, isToday, isPast, onToggleDone, onIntensity, onNote }: Props) {
  const cfg = SESSION_CONFIGS[session.type]
  const dateStr = format(date, 'yyyy-MM-dd')
  const dayNum = date.getDate()

  const done = savedSession?.done ?? session.done ?? false
  const intensity = savedSession?.intensity ?? 0
  const note = savedSession?.note ?? ''

  const [localNote, setLocalNote] = useState(note)
  const [saving, setSaving] = useState(false)

  if (isPast) {
    return (
      <div className="border-r border-b border-gray-200 bg-gray-50 opacity-40 min-h-[110px] p-2">
        <span className="font-bebas text-lg text-gray-400">{dayNum}</span>
      </div>
    )
  }

  async function handleToggle() {
    setSaving(true)
    await onToggleDone(dateStr, !done)
    setSaving(false)
  }

  async function handleIntensity(val: number) {
    await onIntensity(dateStr, val)
  }

  async function handleNoteBlur() {
    if (localNote !== note) {
      await onNote(dateStr, localNote)
    }
  }

  return (
    <div className={clsx(
      'border-r border-b border-gray-200 min-h-[110px] p-2 flex flex-col gap-1 relative transition-colors',
      isToday && 'bg-lime/10',
      done && 'bg-lime/5',
      session.type === 'rest' && 'bg-gray-50/60',
    )}>
      {/* Day number */}
      <span className={clsx('font-bebas text-xl leading-none', isToday ? 'text-lime2' : 'text-navy')}>
        {dayNum}
      </span>

      {/* Done button */}
      <button
        onClick={handleToggle}
        disabled={saving}
        className={clsx(
          'absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
          done ? 'bg-lime border-lime2' : 'border-gray-300 bg-transparent hover:border-lime2'
        )}
        title="Marquer comme fait"
      >
        {done && (
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#0B1628" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Badge */}
      <span className={clsx('text-[9px] font-bold uppercase tracking-wide text-white px-1.5 py-0.5 rounded w-fit leading-tight', cfg.color)}>
        {session.label || cfg.label}
      </span>

      {/* Intensity dots */}
      {session.type !== 'rest' && (
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[8px] text-gray-400 mr-0.5">Intensité</span>
          {[1,2,3,4,5].map(n => (
            <button
              key={n}
              onClick={() => handleIntensity(n)}
              className={clsx('w-1.5 h-1.5 rounded-full transition-colors', n <= intensity ? 'bg-lime2' : 'bg-gray-200')}
            />
          ))}
        </div>
      )}

      {/* Note */}
      <input
        className="text-[9px] border-b border-dashed border-gray-200 bg-transparent outline-none mt-auto w-full py-0.5 text-navy placeholder:text-gray-300 focus:border-lime2"
        placeholder="Note..."
        value={localNote}
        onChange={e => setLocalNote(e.target.value)}
        onBlur={handleNoteBlur}
      />
    </div>
  )
}
