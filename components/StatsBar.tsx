'use client'

interface Props {
  doneSessions: number
  goalSessions: number
  latestWeight?: number
  goalWeight?: number
}

export default function StatsBar({ doneSessions, goalSessions, latestWeight, goalWeight }: Props) {
  const progress = goalSessions > 0 ? Math.min((doneSessions / goalSessions) * 100, 100) : 0

  return (
    <div className="bg-[#132038] px-4 sm:px-8 py-3 flex flex-wrap gap-x-8 gap-y-2 items-center">
      <div className="flex flex-col gap-0.5">
        <span className="text-[9px] tracking-widest text-white/30 uppercase">Séances ✓</span>
        <div className="flex items-end gap-1.5">
          <span className="font-bebas text-2xl text-lime leading-none">{doneSessions}</span>
          <span className="text-white/30 text-xs mb-0.5">/ {goalSessions}</span>
        </div>
        {/* Progress bar */}
        <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-lime rounded-full transition-all" style={{ width: `${progress}%` }}/>
        </div>
      </div>

      <div className="w-px h-6 bg-white/10 hidden sm:block"/>

      <div className="flex flex-col gap-0.5">
        <span className="text-[9px] tracking-widest text-white/30 uppercase">Poids actuel</span>
        <span className="font-bebas text-2xl text-lime leading-none">
          {latestWeight ? `${latestWeight} kg` : '—'}
        </span>
      </div>

      <div className="w-px h-6 bg-white/10 hidden sm:block"/>

      <div className="flex flex-col gap-0.5">
        <span className="text-[9px] tracking-widest text-white/30 uppercase">Objectif</span>
        <span className="font-bebas text-2xl text-lime leading-none">
          {goalWeight ? `${goalWeight} kg` : '80 kg'}
        </span>
      </div>

      {latestWeight && goalWeight && (
        <>
          <div className="w-px h-6 bg-white/10 hidden sm:block"/>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] tracking-widest text-white/30 uppercase">Restant</span>
            <span className="font-bebas text-2xl text-lime leading-none">
              {Math.max(0, latestWeight - goalWeight).toFixed(1)} kg
            </span>
          </div>
        </>
      )}
    </div>
  )
}
