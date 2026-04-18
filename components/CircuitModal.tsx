'use client'
import { CIRCUITS } from '@/lib/config'
import clsx from 'clsx'

interface Props {
  open: boolean
  onClose: () => void
}

const COLORS = {
  circuit1: { header: 'bg-blue-500',    accent: 'text-blue-600', finisher: 'bg-blue-50 border-blue-200' },
  circuit2: { header: 'bg-orange-500',  accent: 'text-orange-600', finisher: 'bg-orange-50 border-orange-200' },
  circuit3: { header: 'bg-emerald-500', accent: 'text-emerald-600', finisher: 'bg-emerald-50 border-emerald-200' },
}

export default function CircuitModal({ open, onClose }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"/>
      <div
        className="relative bg-white w-full sm:max-w-4xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0B1628] px-6 py-4 flex items-center justify-between rounded-t-2xl sm:rounded-t-2xl">
          <div>
            <p className="text-lime text-[9px] tracking-widest uppercase font-mono-dm">Référence</p>
            <h2 className="font-bebas text-3xl text-white leading-none">Les 3 Circuits</h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-2xl leading-none">×</button>
        </div>

        {/* Format banner */}
        <div className="bg-lime px-6 py-2 flex flex-wrap gap-4 items-center">
          <span className="font-bebas text-[#0B1628] text-sm">⚡ Échauffement 3 min avant chaque circuit</span>
          <div className="flex gap-3 text-[10px] font-bold text-[#0B1628]/70">
            <span className="bg-[#0B1628]/10 rounded px-2 py-0.5">40s effort</span>
            <span className="bg-[#0B1628]/10 rounded px-2 py-0.5">20s repos</span>
            <span className="bg-[#0B1628]/10 rounded px-2 py-0.5">× 4 tours</span>
            <span className="bg-[#0B1628]/10 rounded px-2 py-0.5">1:30 entre tours</span>
          </div>
        </div>

        {/* Échauffement */}
        <div className="px-6 py-3 border-b bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Échauffement</p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-700">
            <span>Jumping Jacks <span className="text-[10px] bg-gray-200 rounded px-1">1 min</span></span>
            <span>Montées de genoux <span className="text-[10px] bg-gray-200 rounded px-1">1 min</span></span>
            <span>Shadow Boxing <span className="text-[10px] bg-gray-200 rounded px-1">1 min</span></span>
          </div>
        </div>

        {/* Circuits */}
        <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          {(Object.entries(CIRCUITS) as [keyof typeof CIRCUITS, typeof CIRCUITS[keyof typeof CIRCUITS]][]).map(([key, circuit]) => {
            const col = COLORS[key]
            return (
              <div key={key} className="flex flex-col">
                <div className={clsx('px-4 py-3', col.header)}>
                  <p className="text-white/70 text-[9px] uppercase tracking-widest font-mono-dm">
                    {key === 'circuit1' ? 'Circuit 01 · Lundi' : key === 'circuit2' ? 'Circuit 02 · Mercredi' : 'Circuit 03 · Vendredi'}
                  </p>
                  <p className="font-bebas text-white text-2xl leading-tight">{circuit.name}</p>
                  <p className="text-white/70 text-[10px] italic">{circuit.focus}</p>
                </div>
                <div className="px-4 py-3 flex flex-col gap-3 flex-1">
                  {circuit.exercises.map((ex, i) => {
                    const isFinisher = ex.name.includes('🔥')
                    return (
                      <div key={i} className={clsx('flex flex-col gap-0.5', isFinisher && clsx('border rounded-lg p-2 mt-1', col.finisher))}>
                        {isFinisher && <p className={clsx('text-[9px] font-bold uppercase tracking-wide', col.accent)}>🔥 Finisher cardio</p>}
                        <p className="text-[12px] font-semibold text-[#0B1628]">
                          {String(i + 1).padStart(0, '')}. {ex.name.replace(' 🔥', '')}
                        </p>
                        <p className="text-[10px] text-gray-500 leading-snug">{ex.tip}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Rules */}
        <div className="bg-[#0B1628] px-6 py-4 grid sm:grid-cols-3 gap-3">
          {[
            '3L d\'eau/jour. Bois pendant les 20s de pause.',
            'Contracte volontairement le muscle ciblé. Domine le mouvement.',
            'Sur le finisher : reste en mouvement même si tu ralentis. Ne pose pas le genou.',
          ].map((rule, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="font-bebas text-2xl text-lime leading-none">0{i+1}</span>
              <p className="text-[10px] text-white/55 leading-snug mt-1">{rule}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
