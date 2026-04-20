'use client'
import { createClient } from '@/lib/supabase'
import { useState } from 'react'

export default function LoginPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  async function loginWithEmail(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="bg-[var(--navy)] rounded-2xl p-8 mb-4 text-center">
          <p className="text-lime text-xs tracking-[0.2em] font-mono-dm uppercase mb-1">Sport Planner</p>
          <h1 className="font-bebas text-6xl text-white leading-none mb-1">Objectif</h1>
          <h1 className="font-bebas text-6xl text-lime leading-none">80 kg 🎿</h1>
          <p className="text-white/40 text-xs mt-3 tracking-wide">Ski · Freestyle · Circuits HIIT</p>
        </div>

        {/* Card login */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {sent ? (
            <div className="text-center py-4">
              <div className="text-3xl mb-3">📬</div>
              <p className="font-semibold text-[var(--navy)]">Check tes emails !</p>
              <p className="text-sm text-gray-500 mt-1">Clique sur le lien pour accéder au dashboard.</p>
            </div>
          ) : (
            <>
              <button
                onClick={loginWithGoogle}
                className="w-full flex items-center justify-center gap-3 bg-[var(--navy)] text-white rounded-xl py-3 font-semibold text-sm hover:opacity-90 transition mb-4"
              >
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continuer avec Google
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-200"/>
                <span className="text-xs text-gray-400">ou par email</span>
                <div className="flex-1 h-px bg-gray-200"/>
              </div>

              <form onSubmit={loginWithEmail} className="flex flex-col gap-3">
                <input
                  type="email"
                  required
                  placeholder="ton@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--lime2)] transition"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-lime text-[var(--navy)] rounded-xl py-3 font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
                >
                  {loading ? 'Envoi...' : 'Recevoir le lien de connexion'}
                </button>
              </form>
            </>
          )}
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">Tes données sont privées — RLS Supabase activé 🔒</p>
      </div>
    </div>
  )
}
