'use client'

import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { MapPin, Users, Zap, Shield } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Stats {
  totalRides: number
  upcomingRides: number
  totalEarnings: number
  walletBalance: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const isDriver = user?.role_toggle === 'driver'

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return

      if (isDriver) {
        const { data: rides } = await supabase
          .from('rides')
          .select('*')
          .eq('driver_id', user.id)

        const upcomingRides = rides?.filter((r) => new Date(r.date_time) > new Date()) || []

        setStats({
          totalRides: user.total_rides_given,
          upcomingRides: upcomingRides.length,
          totalEarnings: 0, // Calculate from transactions
          walletBalance: user.wallet_balance,
        })
      } else {
        const { data: bookings } = await supabase
          .from('bookings')
          .select('*, ride:rides(*)')
          .eq('rider_id', user.id)

        const upcomingBookings = bookings?.filter((b) => new Date(b.ride?.date_time) > new Date()) || []

        setStats({
          totalRides: user.total_rides_taken,
          upcomingRides: upcomingBookings.length,
          totalEarnings: 0,
          walletBalance: user.wallet_balance,
        })
      }
    }

    fetchStats()
  }, [user, isDriver])

  const quickActions = isDriver
    ? [
        { label: 'Create New Ride', href: '/dashboard/my-rides', icon: MapPin },
        { label: 'Manage Rides', href: '/dashboard/my-rides', icon: Users },
        { label: 'View Earnings', href: '/dashboard/wallet', icon: Zap },
        { label: 'Safety Features', href: '/dashboard/safety', icon: Shield },
      ]
    : [
        { label: 'Find Rides', href: '/dashboard/find-ride', icon: MapPin },
        { label: 'My Bookings', href: '/dashboard/bookings', icon: Users },
        { label: 'My Wallet', href: '/dashboard/wallet', icon: Zap },
        { label: 'Safety Features', href: '/dashboard/safety', icon: Shield },
      ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}!</h1>
        <p className="text-foreground/60">
          {isDriver
            ? "You're in driver mode. Create and manage your rides here."
            : "You're in rider mode. Find a ride and save some money!"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground/60">
              {isDriver ? 'Total Rides Given' : 'Total Rides Taken'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalRides || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground/60">Upcoming Rides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.upcomingRides || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground/60">Trust Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user?.trust_score || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground/60">Wallet Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{stats?.walletBalance?.toFixed(2) || '0.00'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon as any
          return (
            <Link key={action.href} href={action.href}>
              <Card className="h-full hover:shadow-lg transition cursor-pointer">
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <Icon className="w-8 h-8 mb-3 text-primary" />
                  <p className="font-semibold text-sm">{action.label}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Featured Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Tips</CardTitle>
          <CardDescription>Make the most of CampusCarpool</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <p className="font-semibold text-sm">Build Trust</p>
              <p className="text-xs text-foreground/60">
                Maintain high ratings by being punctual and respectful
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-2xl">🔒</div>
            <div>
              <p className="font-semibold text-sm">Safety First</p>
              <p className="text-xs text-foreground/60">
                Use our SOS feature if you ever feel unsafe during a ride
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-2xl">💰</div>
            <div>
              <p className="font-semibold text-sm">Save Money</p>
              <p className="text-xs text-foreground/60">
                Share rides and split costs - cheaper than other transport!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
