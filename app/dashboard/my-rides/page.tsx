'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Ride, Booking } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MapPin, Clock, Users, AlertCircle, Plus, CheckCircle, XCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'

interface CreateRideForm {
  startLocation: string
  destination: string
  dateTime: string
  seatsTotal: number
  vibe: 'Music' | 'Networking' | 'Silent'
  femaleOnly: boolean
}

export default function MyRidesPage() {
  const { user } = useAuth()
  const [myRides, setMyRides] = useState<Ride[]>([])
  const [bookings, setBookings] = useState<{ [key: string]: Booking[] }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('upcoming')

  const { register, handleSubmit, reset, watch } = useForm<CreateRideForm>({
    defaultValues: {
      vibe: 'Music',
      femaleOnly: false,
      seatsTotal: 3,
    },
  })

  useEffect(() => {
    fetchMyRides()
  }, [user])

  const fetchMyRides = async () => {
    if (!user) return
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .eq('driver_id', user.id)
        .order('date_time', { ascending: true })

      if (error) throw error

      setMyRides(data || [])

      // Fetch bookings for each ride
      const bookingsData: { [key: string]: Booking[] } = {}
      for (const ride of data || []) {
        const { data: rideBookings } = await supabase
          .from('bookings')
          .select('*, rider:users!rider_id(*)')
          .eq('ride_id', ride.id)

        bookingsData[ride.id] = rideBookings || []
      }
      setBookings(bookingsData)
    } catch (error) {
      console.error('Error fetching rides:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onCreateRide = async (data: CreateRideForm) => {
    if (!user) return

    setIsCreating(true)
    try {
      const { error } = await supabase.from('rides').insert([
        {
          driver_id: user.id,
          start_location: data.startLocation,
          destination: data.destination,
          date_time: data.dateTime,
          seats_total: data.seatsTotal,
          seats_available: data.seatsTotal,
          female_only: data.femaleOnly,
          vibe: data.vibe,
          status: 'scheduled',
        },
      ])

      if (error) throw error

      reset()
      setOpenDialog(false)
      alert('Ride created successfully!')
      fetchMyRides()
    } catch (error: any) {
      alert('Error creating ride: ' + error.message)
    } finally {
      setIsCreating(false)
    }
  }

  const handleBookingApproval = async (bookingId: string, rideId: string, approve: boolean) => {
    try {
      await supabase
        .from('bookings')
        .update({ status: approve ? 'approved' : 'rejected' })
        .eq('id', bookingId)

      if (approve) {
        // Create transaction for rider
        const booking = bookings[rideId]?.find((b) => b.id === bookingId)
        if (booking) {
          await supabase.from('transactions').insert([
            {
              user_id: booking.rider_id,
              amount: 5.0, // Fixed amount for now
              type: 'debit',
              ride_id: rideId,
              description: 'Ride payment',
            },
          ])
        }
      }

      fetchMyRides()
    } catch (error: any) {
      alert('Error updating booking: ' + error.message)
    }
  }

  const upcomingRides = myRides.filter((r) => new Date(r.date_time) > new Date())
  const pastRides = myRides.filter((r) => new Date(r.date_time) <= new Date())

  const RideCard = ({ ride }: { ride: Ride }) => {
    const rideBookings = bookings[ride.id] || []
    const pendingBookings = rideBookings.filter((b) => b.status === 'pending')

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
                <p className="text-sm">
                  <span className="font-semibold">{ride.seats_available}</span>/
                  <span className="font-semibold">{ride.seats_total}</span> seats
                </p>
              </div>
            </div>

            {/* Status and Action */}
            <div>
              <Badge variant="secondary" className="mb-2">
                {ride.vibe}
              </Badge>
              {ride.female_only && (
                <Badge variant="secondary" className="ml-2 bg-pink-100 mb-2">
                  👩 Female Only
                </Badge>
              )}
              {pendingBookings.length > 0 && (
                <div className="mt-3 text-xs font-semibold text-amber-600 bg-amber-50 p-2 rounded">
                  {pendingBookings.length} booking request{pendingBookings.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>

          {/* Booking Requests */}
          {pendingBookings.length > 0 && (
            <div className="mt-4 pt-4 border-t space-y-2">
              {pendingBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between bg-amber-50 p-3 rounded">
                  <div>
                    <p className="font-semibold text-sm">{booking.rider?.name}</p>
                    <p className="text-xs text-foreground/60">
                      {booking.seats_booked} seat{booking.seats_booked !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBookingApproval(booking.id, ride.id, true)}
                    >
                      <CheckCircle size={14} className="mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBookingApproval(booking.id, ride.id, false)}
                    >
                      <XCircle size={14} className="mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Rides</h1>
          <p className="text-foreground/60">Create and manage your rides here</p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={20} className="mr-2" />
              Create New Ride
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Ride</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onCreateRide)} className="space-y-4">
              <div>
                <Label htmlFor="startLocation">Pickup Location</Label>
                <Input
                  id="startLocation"
                  placeholder="e.g., Main Library"
                  {...register('startLocation', { required: true })}
                />
              </div>
              <div>
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  placeholder="e.g., Campus"
                  {...register('destination', { required: true })}
                />
              </div>
              <div>
                <Label htmlFor="dateTime">Date & Time</Label>
                <Input
                  id="dateTime"
                  type="datetime-local"
                  {...register('dateTime', { required: true })}
                />
              </div>
              <div>
                <Label htmlFor="seatsTotal">Total Seats</Label>
                <Input
                  id="seatsTotal"
                  type="number"
                  min="1"
                  max="7"
                  {...register('seatsTotal', { required: true })}
                />
              </div>
              <div>
                <Label htmlFor="vibe">Ride Vibe</Label>
                <Select defaultValue="Music" onValueChange={(value: any) => {}}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vibe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Music">Music</SelectItem>
                    <SelectItem value="Networking">Networking</SelectItem>
                    <SelectItem value="Silent">Silent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="femaleOnly"
                  {...register('femaleOnly')}
                  className="rounded"
                />
                <Label htmlFor="femaleOnly">Female Only</Label>
              </div>
              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Ride'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingRides.length})
          </TabsTrigger>
          <TabsTrigger value="past">Past ({pastRides.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {isLoading ? (
            <p className="text-center py-8">Loading...</p>
          ) : upcomingRides.length > 0 ? (
            <div>
              {upcomingRides.map((ride) => (
                <RideCard key={ride.id} ride={ride} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="mx-auto mb-3 text-foreground/40" size={32} />
                <p className="text-foreground/60">No upcoming rides</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastRides.length > 0 ? (
            <div>
              {pastRides.map((ride) => (
                <RideCard key={ride.id} ride={ride} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="mx-auto mb-3 text-foreground/40" size={32} />
                <p className="text-foreground/60">No past rides</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
