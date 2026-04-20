'use client'
import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface WeightLog {
  id: string
  date: string
  weight_kg: number
}

interface Props {
  open: boolean
  onClose: () => void
  weights: WeightLog[]
  goalWeight: number
  onDelete: (id: string) => Promise<void>
  onEdit: (id: string, weight_kg: number) => Promise<void>
}

const CHART_H = 96

export default function WeightHistory({ open, onClose, weights, goalWeight, onDelete, onEdit }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  if (!open) return null

  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date))
  const startWeight = sorted[0]?.weight_kg
  const latestWeight = sorted[sorted.length - 1]?.weight_kg
  const totalLost = startWeight && latestWeight ? +(startWeight - latestWeight).toFixed(1) : 0
  const toGoal = latestWeight != null ? +Math.max(0, latestWeight - goalWeight).toFixed(1) : null

  const allKgs = sorted.map(w => w.weight_kg)
  const minW = allKgs.length ? Math.min(...allKgs, goalWeight) - 0.5 : goalWeight - 5
  const maxW = allKgs.length ? Math.max(...allKgs) + 0.5 : goalWeight + 5
  const range = maxW - minW || 1

  function barPx(kg: number) {
    return Math.max(3, Math.round(((kg - minW) / range) * CHART_H))
  }

  function goalLinePct() {
    return Math.round(((goalWeight - minW) / range) * 100)
  }

  async function confirmEdit(log: WeightLog) {
    const val = parseFloat(editValue.replace(',', '.'))
    if (!isNaN(val) && val !== log.weight_kg) await onEdit(log.id, val)
    setEditingId(null)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0B1628] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          {/* Header */}
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
                {totalLost > 0 ? `-${totalLost} kg` : totalLost < 0 ? `+${Math.abs(totalLost)} kg` : '—'}
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-[9px] text-white/30 uppercase tracking-widest">Restant</p>
              <p className="font-bebas text-2xl text-lime">{toGoal !== null ? `${toGoal} kg` : '—'}</p>
            </div>
          </div>

          {/* Graphique */}
          {sorted.length > 0 ? (
            <div className="mb-6">
              <div className="relative" style={{ height: CHART_H + 8 }}>
                {/* Ligne objectif */}
                <div
                  className="absolute left-0 right-0 border-t border-dashed border-lime/50 pointer-events-none"
                  style={{ bottom: `${goalLinePct()}%` }}
                >
                  <span className="text-[8px] text-lime/70 absolute -top-3 right-0">{goalWeight} kg</span>
                </div>
                {/* Barres */}
                <div className="absolute bottom-0 left-0 right-0 flex items-end gap-0.5 h-full">
                  {sorted.map(w => (
                    <div key={w.date} className="flex-1 flex flex-col items-center justify-end">
                      <div
                        className={`w-full rounded-t-sm transition-all ${w.weight_kg <= goalWeight ? 'bg-lime' : 'bg-white/40'}`}
                        style={{ height: barPx(w.weight_kg) }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              {/* Labels dates */}
              <div className="flex gap-0.5 mt-1">
                {sorted.map(w => (
                  <div key={w.date} className="flex-1 text-center">
                    <p className="text-[7px] text-white/25 truncate">
                      {format(new Date(w.date + 'T12:00:00'), 'd/M')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-white/30 text-sm text-center py-4 mb-4">Aucune donnée</p>
          )}

          {/* Liste CRUD */}
          <div className="flex flex-col gap-0.5">
            {[...sorted].reverse().map((w, i, arr) => {
              const prev = arr[i + 1]
              const diff = prev ? +(w.weight_kg - prev.weight_kg).toFixed(1) : null
              const isEditing = editingId === w.id

              return (
                <div key={w.id} className="flex items-center justify-between py-2 border-b border-white/5 gap-2">
                  <span className="text-white/40 text-xs shrink-0">
                    {format(new Date(w.date + 'T12:00:00'), 'EEE d MMM', { locale: fr })}
                  </span>

                  <div className="flex items-center gap-2 ml-auto">
                    {diff !== null && (
                      <span className={`text-xs font-mono ${diff < 0 ? 'text-lime' : diff > 0 ? 'text-red-400' : 'text-white/20'}`}>
                        {diff > 0 ? `+${diff}` : diff} kg
                      </span>
                    )}

                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          autoFocus
                          type="number"
                          step="0.1"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') confirmEdit(w); if (e.key === 'Escape') setEditingId(null) }}
                          className="bg-white/10 text-white text-sm px-2 py-0.5 rounded w-20 outline-none focus:ring-1 focus:ring-lime"
                        />
                        <span className="text-white/30 text-xs">kg</span>
                        <button onClick={() => confirmEdit(w)} className="text-lime text-xs font-bold px-2 py-0.5 bg-lime/10 rounded">✓</button>
                        <button onClick={() => setEditingId(null)} className="text-white/30 text-xs px-1">✕</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingId(w.id); setEditValue(w.weight_kg.toString()) }}
                        className="font-bebas text-xl text-white hover:text-lime transition"
                      >
                        {w.weight_kg} kg
                      </button>
                    )}

                    <button
                      onClick={() => onDelete(w.id)}
                      className="text-white/20 hover:text-red-400 transition text-sm ml-1"
                      title="Supprimer"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
