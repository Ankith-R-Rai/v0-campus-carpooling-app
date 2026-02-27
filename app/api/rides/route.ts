import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startLocation = searchParams.get('startLocation')
    const destination = searchParams.get('destination')
    const vibe = searchParams.get('vibe')

    let query = supabase
      .from('rides')
      .select('*, driver:users!driver_id(*)')
      .eq('status', 'scheduled')
      .gt('date_time', new Date().toISOString())
      .order('date_time', { ascending: true })

    if (startLocation) {
      query = query.ilike('start_location', `%${startLocation}%`)
    }

    if (destination) {
      query = query.ilike('destination', `%${destination}%`)
    }

    if (vibe && vibe !== 'All') {
      query = query.eq('vibe', vibe)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data, error } = await supabase.from('rides').insert([body]).select()

    if (error) throw error

    return NextResponse.json(data[0], { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
