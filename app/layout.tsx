import type { Metadata } from 'next'
import { Bebas_Neue, DM_Sans, DM_Mono } from 'next/font/google'
import './globals.css'

const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
})

const dmMono = DM_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-dm-mono',
})

export const metadata: Metadata = {
  title: 'Sport Planner 🎿',
  description: 'Objectif ski & freestyle – suivi de séances',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${bebas.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body className="font-[family-name:var(--font-dm-sans)] bg-[#E8EAE4] min-h-screen">
        {children}
      </body>
    </html>
  )
}
