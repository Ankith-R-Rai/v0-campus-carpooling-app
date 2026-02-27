'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Booking, Ride, User } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MapPin, Clock, Users, AlertCircle, User as UserIcon, Star } from 'lucide-react'

interface BookingWithDetails extends Booking {
  ride: Ride & { driver: User }
}

export default function BookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')

  useEffect(() => {
    fetchBookings()
  }, [user])

  const fetchBookings = async () => {
    if (!user) return
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, ride:rides(*, driver:users!driver_id(*))')
        .eq('rider_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setBookings(data || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string, rideId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    try {
      // Update booking status
      await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId)

      // Refund user
      if (user) {
        await supabase
          .from('users')
          .update({ wallet_balance: user.wallet_balance + 5 })
          .eq('id', user.id)
      }

      alert('Booking cancelled successfully!')
      fetchBookings()
    } catch (error: any) {
      alert('Error cancelling booking: ' + error.message)
    }
  }

  const upcomingBookings = bookings.filter(
    (b) => new Date(b.ride.date_time) > new Date() && b.status !== 'cancelled'
  )
  const pastBookings = bookings.filter(
    (b) => new Date(b.ride.date_time) <= new Date() || b.status === 'cancelled'
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const BookingCard = ({ booking }: { booking: BookingWithDetails }) => {
    const ride = booking.ride
    const driver = ride.driver

    return (
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Route */}
            <div className="col-span-2">
              <div className="flex items-start gap-3">
                <MapPin className="text-primary mt-1" size={20} />
                <div>
                  <p className="font-semibold">{ride.start_location}</p>
                  <p className="text-xs text-foreground/60 my-1">→</p>
                  <p className="font-semibold">{ride.destination}</p>
                </div>
              </div>
            </div>

            {/* Time and Details */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock size={16} className="text-primary" />
                <div>
                  <p className="font-semibold text-sm">
                    {new Date(ride.date_time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="text-xs text-foreground/60">
                    {new Date(ride.date_time).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-primary" />
                <p className="text-sm">{booking.seats_booked} seat(s)</p>
              </div>
            </div>

            {/* Driver Info and Status */}
            <div>
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <UserIcon size={16} className="text-primary" />
                  <p className="font-semibold text-sm">{driver?.name}</p>
                </div>
                {driver && (
                  <div className="flex items-center gap-1 text-xs">
                    <Star size={12} className="fill-yellow-500 text-yellow-500" />
                    <span>{driver.trust_score}</span>
                  </div>
                )}
              </div>

              <Badge className={`text-xs ${getStatusColor(booking.status)}`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Badge>

              {booking.status === 'approved' && new Date(ride.date_time) > new Date() && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-3"
                  onClick={() => handleCancelBooking(booking.id, ride.id)}
                >
                  Cancel Booking
                </Button>
              )}

              {new Date(ride.date_time) <= new Date() && booking.status === 'completed' && (
                <Button size="sm" variant="outline" className="w-full mt-3">
                  Rate Driver
                </Button>
              )}
            </div>
          </div>

          {/* Additional Details */}
          <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
            <Badge variant="secondary">{ride.vibe}</Badge>
            {ride.female_only && (
              <Badge variant="secondary" className="bg-pink-100">
                👩 Female Only
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
        <p className="text-foreground/60">View and manage your ride bookings</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {isLoading ? (
            <p className="text-center py-8">Loading...</p>
          ) : upcomingBookings.length > 0 ? (
            <div>
              {upcomingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="mx-auto mb-3 text-foreground/40" size={32} />
                <p className="text-foreground/60">No upcoming bookings</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastBookings.length > 0 ? (
            <div>
              {pastBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="mx-auto mb-3 text-foreground/40" size={32} />
                <p className="text-foreground/60">No past bookings</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
