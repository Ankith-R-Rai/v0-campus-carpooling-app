import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([
        {
          ride_id: body.ride_id,
          rider_id: body.rider_id,
          seats_booked: body.seats_booked || 1,
          status: 'pending',
        },
      ])
      .select()

    if (bookingError) throw bookingError

    // Update ride available seats
    const { data: ride } = await supabase
      .from('rides')
      .select('seats_available')
      .eq('id', body.ride_id)
      .single()

    if (ride) {
      await supabase
        .from('rides')
        .update({ seats_available: ride.seats_available - (body.seats_booked || 1) })
        .eq('id', body.ride_id)
    }

    return NextResponse.json(booking[0], { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const bookingId = body.id
    const newStatus = body.status

    const { data, error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId)
      .select()

    if (error) throw error

    // If approved, create transaction
    if (newStatus === 'approved') {
      await supabase.from('transactions').insert([
        {
          user_id: body.rider_id,
          amount: 5.0,
          type: 'debit',
          ride_id: body.ride_id,
          description: 'Ride payment',
        },
      ])
    }

    return NextResponse.json(data[0])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
