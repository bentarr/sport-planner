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

const W = 400
const H = 120
const PAD = { top: 12, right: 16, bottom: 24, left: 36 }
const CW = W - PAD.left - PAD.right
const CH = H - PAD.top - PAD.bottom

export default function WeightHistory({ open, onClose, weights, goalWeight, onDelete, onEdit }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  if (!open) return null

  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date))
  const startWeight = sorted[0]?.weight_kg
  const latestWeight = sorted[sorted.length - 1]?.weight_kg
  const totalLost = startWeight && latestWeight ? +(startWeight - latestWeight).toFixed(1) : 0
  const toGoal = latestWeight != null ? +Math.max(0, latestWeight - goalWeight).toFixed(1) : null
  const reached = latestWeight != null && latestWeight <= goalWeight

  // SVG scales
  const kgs = sorted.map(w => w.weight_kg)
  const minW = kgs.length ? Math.min(...kgs, goalWeight) - 1 : goalWeight - 5
  const maxW = kgs.length ? Math.max(...kgs) + 1 : goalWeight + 10
  const range = maxW - minW || 1

  function xPos(i: number) {
    if (sorted.length <= 1) return PAD.left + CW / 2
    return PAD.left + (i / (sorted.length - 1)) * CW
  }
  function yPos(kg: number) {
    return PAD.top + ((maxW - kg) / range) * CH
  }

  const goalY = yPos(goalWeight)
  const points = sorted.map((w, i) => ({ x: xPos(i), y: yPos(w.weight_kg), ...w }))
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = points.length > 0
    ? `${linePath} L${points[points.length - 1].x},${H - PAD.bottom} L${points[0].x},${H - PAD.bottom} Z`
    : ''

  // Y-axis labels
  const yLabels = [maxW, (maxW + minW) / 2, minW].map(v => ({ kg: Math.round(v * 2) / 2, y: yPos(v) }))

  async function confirmEdit(log: WeightLog) {
    const val = parseFloat(editValue.replace(',', '.'))
    if (!isNaN(val) && val !== log.weight_kg) await onEdit(log.id, val)
    setEditingId(null)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#0B1628] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">

          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-lime text-[9px] tracking-[0.2em] font-mono uppercase mb-0.5">Évolution du poids</p>
              <h2 className="font-bebas text-5xl text-white leading-none">
                {latestWeight ? `${latestWeight} kg` : '— kg'}
                {reached && <span className="text-lime ml-2 text-2xl">🎯</span>}
              </h2>
              {startWeight && latestWeight && (
                <p className="text-white/30 text-xs mt-0.5">
                  Depuis {format(new Date(sorted[0].date + 'T12:00:00'), 'd MMM yyyy', { locale: fr })}
                </p>
              )}
            </div>
            <button onClick={onClose} className="text-white/20 hover:text-white text-2xl leading-none mt-1">×</button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { label: 'Départ', value: startWeight ? `${startWeight} kg` : '—', color: 'text-white' },
              { label: 'Perdu', value: totalLost > 0 ? `-${totalLost} kg` : totalLost < 0 ? `+${Math.abs(totalLost)} kg` : '—', color: totalLost > 0 ? 'text-lime' : 'text-red-400' },
              { label: 'Objectif', value: toGoal !== null ? (reached ? '✓ Atteint !' : `${toGoal} kg`) : '—', color: reached ? 'text-lime' : 'text-white/70' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">{s.label}</p>
                <p className={`font-bebas text-xl leading-none ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* SVG Chart */}
          {sorted.length >= 2 ? (
            <div className="bg-white/5 rounded-xl p-3 mb-5">
              <svg
                viewBox={`0 0 ${W} ${H}`}
                className="w-full"
                style={{ height: 130 }}
                onMouseLeave={() => setHoverIdx(null)}
              >
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C4FF5E" stopOpacity="0.25"/>
                    <stop offset="100%" stopColor="#C4FF5E" stopOpacity="0"/>
                  </linearGradient>
                </defs>

                {/* Y-axis labels */}
                {yLabels.map(l => (
                  <text key={l.kg} x={PAD.left - 4} y={l.y + 4} textAnchor="end" fontSize="8" fill="rgba(255,255,255,0.25)">
                    {l.kg}
                  </text>
                ))}

                {/* Horizontal grid lines */}
                {yLabels.map(l => (
                  <line key={l.kg} x1={PAD.left} y1={l.y} x2={W - PAD.right} y2={l.y} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                ))}

                {/* Goal line */}
                <line x1={PAD.left} y1={goalY} x2={W - PAD.right} y2={goalY} stroke="#C4FF5E" strokeWidth="1" strokeDasharray="4 3" opacity="0.5"/>
                <text x={W - PAD.right + 2} y={goalY + 3} fontSize="8" fill="#C4FF5E" opacity="0.7">{goalWeight}</text>

                {/* Area fill */}
                <path d={areaPath} fill="url(#areaGrad)"/>

                {/* Line */}
                <path d={linePath} fill="none" stroke="#C4FF5E" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>

                {/* Data points + hover */}
                {points.map((p, i) => (
                  <g key={p.id} onMouseEnter={() => setHoverIdx(i)}>
                    <circle cx={p.x} cy={p.y} r="10" fill="transparent"/>
                    <circle cx={p.x} cy={p.y} r={hoverIdx === i ? 4 : 3}
                      fill={p.weight_kg <= goalWeight ? '#C4FF5E' : '#0B1628'}
                      stroke="#C4FF5E" strokeWidth="1.5"
                    />
                    {hoverIdx === i && (
                      <g>
                        <rect x={p.x - 22} y={p.y - 22} width="44" height="14" rx="4" fill="#0B1628" stroke="#C4FF5E" strokeWidth="0.5" opacity="0.9"/>
                        <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="8" fill="#C4FF5E" fontWeight="bold">
                          {p.weight_kg} kg
                        </text>
                      </g>
                    )}
                  </g>
                ))}

                {/* X-axis dates — first and last only */}
                {points.length > 0 && (
                  <>
                    <text x={points[0].x} y={H - 4} textAnchor="start" fontSize="7" fill="rgba(255,255,255,0.25)">
                      {format(new Date(points[0].date + 'T12:00:00'), 'd MMM', { locale: fr })}
                    </text>
                    {points.length > 1 && (
                      <text x={points[points.length-1].x} y={H - 4} textAnchor="end" fontSize="7" fill="rgba(255,255,255,0.25)">
                        {format(new Date(points[points.length-1].date + 'T12:00:00'), 'd MMM', { locale: fr })}
                      </text>
                    )}
                  </>
                )}
              </svg>
            </div>
          ) : sorted.length === 1 ? (
            <div className="bg-white/5 rounded-xl p-4 mb-5 text-center text-white/30 text-xs">
              Ajoute une 2ème mesure pour voir la courbe
            </div>
          ) : null}

          {/* Liste CRUD */}
          <div className="space-y-0.5">
            {[...sorted].reverse().map((w, i, arr) => {
              const prev = arr[i + 1]
              const diff = prev ? +(w.weight_kg - prev.weight_kg).toFixed(1) : null
              const isEditing = editingId === w.id

              return (
                <div key={w.id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0 group">
                  <span className="text-white/40 text-xs w-28 shrink-0">
                    {format(new Date(w.date + 'T12:00:00'), 'EEE d MMM', { locale: fr })}
                  </span>

                  <div className="flex items-center gap-3 ml-auto">
                    {diff !== null && (
                      <span className={`text-[10px] font-mono tabular-nums ${diff < 0 ? 'text-lime' : diff > 0 ? 'text-red-400' : 'text-white/20'}`}>
                        {diff > 0 ? `+${diff}` : diff} kg
                      </span>
                    )}

                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          autoFocus
                          type="number"
                          step="0.1"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') confirmEdit(w); if (e.key === 'Escape') setEditingId(null) }}
                          className="bg-white/10 text-white text-sm px-2 py-0.5 rounded w-20 outline-none focus:ring-1 focus:ring-lime"
                        />
                        <button onClick={() => confirmEdit(w)} className="text-lime text-xs font-bold px-2 py-0.5 bg-lime/10 rounded hover:bg-lime/20">✓</button>
                        <button onClick={() => setEditingId(null)} className="text-white/30 hover:text-white text-xs px-1">✕</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingId(w.id); setEditValue(w.weight_kg.toString()) }}
                        className="font-bebas text-2xl text-white hover:text-lime transition leading-none"
                      >
                        {w.weight_kg} <span className="text-sm text-white/30">kg</span>
                      </button>
                    )}

                    <button
                      onClick={() => onDelete(w.id)}
                      className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )
            })}
            {sorted.length === 0 && (
              <p className="text-white/20 text-sm text-center py-8">Aucun poids enregistré</p>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
