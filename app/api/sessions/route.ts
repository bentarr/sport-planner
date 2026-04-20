import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

async function makeSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options?: object }[]) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
          )
        },
      },
    }
  )
}

// GET /api/sessions?year=2026&month=4
export async function GET(req: NextRequest) {
  try {
    const supabase = await makeSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) return NextResponse.json({ error: 'Auth error', detail: authError.message }, { status: 401 })
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const year  = parseInt(searchParams.get('year')  || '2026')
    const month = parseInt(searchParams.get('month') || '1')

    const from = `${year}-${String(month).padStart(2,'0')}-01`
    const to   = new Date(year, month, 0).toISOString().slice(0,10)

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', from)
      .lte('date', to)
      .order('date')

    if (error) return NextResponse.json({ error: error.message, code: error.code }, { status: 500 })
    return NextResponse.json(data)
  } catch (e: unknown) {
    return NextResponse.json({ error: 'Unexpected', detail: String(e) }, { status: 500 })
  }
}

// POST /api/sessions  { date, type, done, intensity, note, duration_min }
export async function POST(req: NextRequest) {
  try {
    const supabase = await makeSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) return NextResponse.json({ error: 'Auth error', detail: authError.message }, { status: 401 })
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { data, error } = await supabase
      .from('sessions')
      .insert({ ...body, user_id: user.id })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message, code: error.code }, { status: 500 })
    return NextResponse.json(data)
  } catch (e: unknown) {
    return NextResponse.json({ error: 'Unexpected', detail: String(e) }, { status: 500 })
  }
}

// PATCH /api/sessions  { id, done?, intensity?, note?, duration_min? }
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await makeSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) return NextResponse.json({ error: 'Auth error', detail: authError.message }, { status: 401 })
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, ...updates } = await req.json()
    const { data, error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message, code: error.code }, { status: 500 })
    return NextResponse.json(data)
  } catch (e: unknown) {
    return NextResponse.json({ error: 'Unexpected', detail: String(e) }, { status: 500 })
  }
}
