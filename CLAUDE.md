# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
```

No test runner or lint script is configured. TypeScript type-checking: `npx tsc --noEmit`.

## Stack

- **Next.js 15** (App Router) + **React 19** — all interactive components use `'use client'`
- **Supabase** — auth (Google OAuth + Email OTP) and PostgreSQL with Row-Level Security
- **Tailwind CSS** — custom colors: navy `#0B1628`, lime `#C4FF5E`, lime2 `#8FCC1A`
- **date-fns** with French locale for all date formatting
- **Fonts**: Bebas Neue (headings), DM Sans (body), DM Mono (labels)

## Architecture

### Routes
- `/` — Login page (Google OAuth + Email OTP)
- `/dashboard` — Main app; calendar grid, stats bar, weight input
- `/api/sessions` — GET (by year/month), POST (create/upsert), PATCH (partial update)
- `/api/weight` — GET (last 30 logs), POST (upsert by date)

### Data flow
All user interactions in `DayCell` (toggle done, set intensity, edit note) immediately `fetch()` to the API routes, which verify auth then call Supabase. No optimistic updates — the component shows a brief saving state. Sessions are keyed by ISO date string `YYYY-MM-DD`.

### Session configuration (`lib/config.ts`)
- **Weekly plan**: hardcoded 7-day cycle (session type per weekday)
- **Special days**: override map for April 17–19 2026 (program pre-start)
- **Program start date**: April 20 2026 — days before this render faded/read-only
- **3 circuits**: Park Master, Sculpt & Burn, Freeride — each with 6 exercises + finisher

### Authentication
Dashboard page checks `supabase.auth.getUser()` on mount; redirects to `/` if unauthenticated. API routes also verify auth before any DB operation.

### Database (Supabase)
Three tables with RLS (`auth.uid() = user_id` on all):
- `sessions` — unique on `(user_id, date)`, stores type/done/intensity/note
- `weight_logs` — unique on `(user_id, date)`, stores `weight_kg`
- `profiles` — auto-created on signup via trigger, stores goal_sessions (default 16), goal_weight_kg

Full schema in `supabase/schema.sql`.

## Environment

Copy `.env.example` to `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Print support

The calendar supports A4 landscape printing. Use `.no-print` class on elements to hide from print output. CSS is in `app/globals.css`.
