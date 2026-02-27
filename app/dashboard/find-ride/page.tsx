'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Ride, Booking } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, Users, Heart, AlertCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function FindRidePage() {
  const { user } = useAuth()
  const [rides, setRides] = useState<Ride[]>([])
  const [filteredRides, setFilteredRides] = useState<Ride[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchStart, setSearchStart] = useState('')
  const [searchDest, setSearchDest] = useState('')
  const [selectedVibe, setSelectedVibe] = useState('')
  const [bookingStates, setBookingStates] = useState<{ [key: string]: boolean }>({})

  const vibes = ['All', 'Music', 'Networking', 'Silent']

  useEffect(() => {
    fetchRides()
  }, [])

  const fetchRides = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('rides')
        .select('*, driver:users!driver_id(*)')
        .eq('status', 'scheduled')
        .gt('date_time', new Date().toISOString())
        .order('date_time', { ascending: true })

      if (error) throw error
      setRides(data || [])
      setFilteredRides(data || [])
    } catch (error) {
      console.error('Error fetching rides:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let filtered = rides

    // Filter by start location
    if (searchStart) {
      filtered = filtered.filter((r) =>
        r.start_location.toLowerCase().includes(searchStart.toLowerCase())
      )
    }

    // Filter by destination
    if (searchDest) {
      filtered = filtered.filter((r) =>
        r.destination.toLowerCase().includes(searchDest.toLowerCase())
      )
    }

    // Filter by vibe
    if (selectedVibe && selectedVibe !== 'All') {
      filtered = filtered.filter((r) => r.vibe === selectedVibe)
    }

    // Filter out rides with no available seats
    filtered = filtered.filter((r) => r.seats_available > 0)

    setFilteredRides(filtered)
  }, [searchStart, searchDest, selectedVibe, rides])

  const handleBookRide = async (rideId: string) => {
    if (!user) return

    setBookingStates({ ...bookingStates, [rideId]: true })

    try {
      // Create booking
      const { error } = await supabase.from('bookings').insert([
        {
          ride_id: rideId,
          rider_id: user.id,
          seats_booked: 1,
          status: 'pending',
        },
      ])

      if (error) throw error

      // Update available seats
      const ride = rides.find((r) => r.id === rideId)
      if (ride) {
        await supabase
          .from('rides')
          .update({ seats_available: ride.seats_available - 1 })
          .eq('id', rideId)
      }

      alert('Ride booked successfully! Awaiting driver approval.')
      fetchRides()
    } catch (error: any) {
      alert('Error booking ride: ' + error.message)
    } finally {
      setBookingStates({ ...bookingStates, [rideId]: false })
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find a Ride</h1>
        <p className="text-foreground/60">Browse available rides and book your next journey</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Search Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Pickup Location</label>
              <Input
                placeholder="e.g., Main Library"
                value={searchStart}
                onChange={(e) => setSearchStart(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Destination</label>
              <Input
                placeholder="e.g., Campus"
                value={searchDest}
                onChange={(e) => setSearchDest(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Ride Vibe</label>
              <div className="flex gap-2 flex-wrap">
                {vibes.map((vibe) => (
                  <Badge
                    key={vibe}
                    variant={selectedVibe === vibe || (vibe === 'All' && !selectedVibe) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedVibe(vibe === 'All' ? '' : vibe)}
                  >
                    {vibe}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <p className="text-xs text-foreground/60">
            {filteredRides.length} ride{filteredRides.length !== 1 ? 's' : ''} available
          </p>
        </CardContent>
      </Card>

      {/* Rides List */}
      <div className="space-y-4">
        {isLoading ? (
          Array(3)
            .fill(0)
            .map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-24" />
                </CardContent>
              </Card>
            ))
        ) : filteredRides.length > 0 ? (
          filteredRides.map((ride) => (
            <Card key={ride.id} className="hover:shadow-lg transition">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Route */}
                  <div className="col-span-2">
                    <div className="flex items-start gap-3">
                      <MapPin className="text-primary mt-1" size={20} />
                      <div>
                        <p className="font-semibold text-sm">{ride.start_location}</p>
                        <p className="text-xs text-foreground/60 my-1">→</p>
                        <p className="font-semibold text-sm">{ride.destination}</p>
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
                        <span className="font-semibold">{ride.seats_available}</span> seat
                        {ride.seats_available !== 1 ? 's' : ''} left
                      </p>
                    </div>
                  </div>

                  {/* Driver Info and Action */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-foreground/60 mb-1">Driver</p>
                      <p className="font-semibold text-sm">{ride.driver?.name}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-yellow-500">★</span>
                        <span className="text-xs">{ride.driver?.trust_score || 5.0}</span>
                      </div>

                      {/* Badges */}
                      <div className="flex gap-1 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {ride.vibe}
                        </Badge>
                        {ride.female_only && (
                          <Badge variant="secondary" className="text-xs bg-pink-100">
                            👩 Female Only
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => handleBookRide(ride.id)}
                      disabled={bookingStates[ride.id]}
                      className="w-full mt-4"
                    >
                      {bookingStates[ride.id] ? 'Booking...' : 'Book Ride'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <AlertCircle className="mx-auto mb-3 text-foreground/40" size={32} />
              <p className="text-foreground/60">No rides found matching your criteria</p>
              <p className="text-xs text-foreground/40 mt-2">Try adjusting your search filters</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
