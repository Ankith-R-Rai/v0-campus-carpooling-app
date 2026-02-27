'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  MapPin,
  Wallet,
  Star,
  AlertCircle,
  LogOut,
  Menu,
  Plus,
} from 'lucide-react'
import { useState } from 'react'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/find-ride', label: 'Find Ride', icon: MapPin },
    { href: '/dashboard/my-rides', label: 'My Rides', icon: Plus },
    { href: '/dashboard/bookings', label: 'Bookings', icon: Menu },
    { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
    { href: '/dashboard/ratings', label: 'Ratings', icon: Star },
    { href: '/dashboard/safety', label: 'Safety', icon: AlertCircle },
  ]

  const isDriver = user?.role_toggle === 'driver'

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-primary text-primary-foreground rounded"
      >
        <Menu size={20} />
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform fixed lg:relative w-64 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border z-30 flex flex-col`}
      >
        <div className="p-6 border-b border-sidebar-border flex items-center gap-3">
          <img src="/logo.svg" alt="Hopper" className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">Hopper</h1>
            <p className="text-xs text-sidebar-foreground/60">
              {isDriver ? 'Driver Mode' : 'Rider Mode'}
            </p>
          </div>
        </div>

        {/* User Info Card */}
        <div className="p-4 m-4 bg-sidebar-primary/10 rounded-lg border border-sidebar-border">
          <p className="font-semibold text-sm">{user?.name}</p>
          <p className="text-xs text-sidebar-foreground/70">{user?.email}</p>
          <div className="flex items-center mt-2 gap-2">
            <div className="flex items-center">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              <span className="text-xs ml-1">{user?.trust_score}</span>
            </div>
            <div className="text-xs text-sidebar-foreground/60">
              ₹{user?.wallet_balance.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'hover:bg-sidebar-accent/10 text-sidebar-foreground'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Toggle Role */}
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <Button
            variant="outline"
            className="w-full text-xs"
            onClick={() => {
              // Toggle role in auth context
              const updatedUser = {
                ...user!,
                role_toggle: isDriver ? 'rider' : 'driver',
              }
              localStorage.setItem('carpoolUser', JSON.stringify(updatedUser))
              window.location.reload()
            }}
          >
            Switch to {isDriver ? 'Rider' : 'Driver'}
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-xs"
            onClick={handleLogout}
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
