'use client'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface WeightLog {
  date: string
  weight_kg: number
}

interface Props {
  open: boolean
  onClose: () => void
  weights: WeightLog[]
  goalWeight: number
}

export default function WeightHistory({ open, onClose, weights, goalWeight }: Props) {
  if (!open) return null

  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date))
  const startWeight = sorted[0]?.weight_kg
  const latestWeight = sorted[sorted.length - 1]?.weight_kg
  const totalLost = startWeight && latestWeight ? startWeight - latestWeight : 0
  const toGoal = latestWeight ? Math.max(0, latestWeight - goalWeight) : null

  const minW = sorted.length ? Math.min(...sorted.map(w => w.weight_kg)) - 1 : goalWeight
  const maxW = sorted.length ? Math.max(...sorted.map(w => w.weight_kg)) + 1 : goalWeight + 10
  const range = maxW - minW || 1

  function barHeight(kg: number) {
    return Math.round(((kg - minW) / range) * 100)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0B1628] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-lime text-[9px] tracking-widest font-mono uppercase">Évolution</p>
              <h2 className="font-bebas text-4xl text-white leading-none">Poids</h2>
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white text-2xl leading-none">×</button>
          </div>

          {/* Stats résumé */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-[9px] text-white/30 uppercase tracking-widest">Départ</p>
              <p className="font-bebas text-2xl text-white">{startWeight ? `${startWeight} kg` : '—'}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-[9px] text-white/30 uppercase tracking-widest">Perdu</p>
              <p className={`font-bebas text-2xl ${totalLost > 0 ? 'text-lime' : 'text-white'}`}>
                {totalLost > 0 ? `-${totalLost.toFixed(1)} kg` : '—'}
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-[9px] text-white/30 uppercase tracking-widest">Restant</p>
              <p className="font-bebas text-2xl text-lime">{toGoal !== null ? `${toGoal.toFixed(1)} kg` : '—'}</p>
            </div>
          </div>

          {/* Graphique barres CSS */}
          {sorted.length > 0 && (
            <div className="mb-6">
              <div className="flex items-end gap-1 h-24 relative">
                {/* Ligne objectif */}
                <div
                  className="absolute left-0 right-0 border-t border-dashed border-lime/40"
                  style={{ bottom: `${barHeight(goalWeight)}%` }}
                >
                  <span className="text-[8px] text-lime/60 absolute -top-3 right-0">{goalWeight} kg</span>
                </div>
                {sorted.map(w => (
                  <div key={w.date} className="flex-1 flex flex-col items-center gap-0.5 group">
                    <div
                      className={`w-full rounded-t transition-all ${w.weight_kg <= goalWeight ? 'bg-lime' : 'bg-white/30'}`}
                      style={{ height: `${barHeight(w.weight_kg)}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-1 mt-1">
                {sorted.map(w => (
                  <div key={w.date} className="flex-1 text-center">
                    <p className="text-[7px] text-white/20 truncate">
                      {format(new Date(w.date), 'd MMM', { locale: fr })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Liste */}
          <div className="flex flex-col gap-1">
            {[...sorted].reverse().map((w, i) => {
              const prev = sorted[sorted.length - 2 - i]
              const diff = prev ? w.weight_kg - prev.weight_kg : null
              return (
                <div key={w.date} className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-white/50 text-xs">
                    {format(new Date(w.date), 'EEEE d MMMM', { locale: fr })}
                  </span>
                  <div className="flex items-center gap-3">
                    {diff !== null && (
                      <span className={`text-xs font-mono ${diff < 0 ? 'text-lime' : diff > 0 ? 'text-red-400' : 'text-white/20'}`}>
                        {diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)} kg
                      </span>
                    )}
                    <span className="font-bebas text-xl text-white">{w.weight_kg} kg</span>
                  </div>
                </div>
              )
            })}
            {sorted.length === 0 && (
              <p className="text-white/30 text-sm text-center py-8">Aucun poids enregistré</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
