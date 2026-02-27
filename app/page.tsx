'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ArrowRight, Users, Leaf, TrendingUp, MapPin, Calendar, Users2, Zap, Shield, MessageCircle, BarChart3 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { User } from '@/lib/types'

export default function Landing() {
  const router = useRouter()
  const { user, setUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Sign up state
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupGender, setSignupGender] = useState<'male' | 'female' | 'other'>('other')

  if (user) {
    router.push('/dashboard')
    return null
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { data: users, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', loginEmail)
        .single()

      if (fetchError || !users) {
        setError('Invalid email or password')
        setIsLoading(false)
        return
      }

      const userData: User = users
      localStorage.setItem('carpoolUser', JSON.stringify(userData))
      setUser(userData)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', signupEmail)
        .single()

      if (existing) {
        setError('Email already registered')
        setIsLoading(false)
        return
      }

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            name: signupName,
            email: signupEmail,
            gender: signupGender,
            trust_score: 5.0,
            wallet_balance: 100,
            role_toggle: 'rider',
            total_rides_given: 0,
            total_rides_taken: 0,
          },
        ])
        .select()
        .single()

      if (insertError || !newUser) {
        setError('Failed to create account')
        setIsLoading(false)
        return
      }

      const userData: User = newUser
      localStorage.setItem('carpoolUser', JSON.stringify(userData))
      setUser(userData)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Sign up failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Hopper" className="w-10 h-10" />
            <span className="text-2xl font-bold text-primary">Hopper</span>
          </div>
          <div className="hidden md:flex gap-8">
            <a href="#features" className="text-slate-600 hover:text-primary font-medium">Features</a>
            <a href="#impact" className="text-slate-600 hover:text-primary font-medium">Impact</a>
          </div>
        </div>
      </nav>

      {/* Hero + Auth Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Hero Content */}
          <div>
            <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Cut the Traffic.
              <br />
              <span className="text-primary">Share the Vibe.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Connect with verified peers from your college for safe, affordable rides. Share your journey, reduce emissions, and build community.
            </p>
            <div className="flex gap-4 flex-wrap">
              <button 
                onClick={() => setActiveTab('signup')}
                className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition flex items-center gap-2"
              >
                Start Riding <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setActiveTab('signup')}
                className="px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition"
              >
                Offer a Ride
              </button>
            </div>
          </div>

          {/* Right: Auth Card */}
          <div>
            <Card className="p-8 bg-gradient-to-br from-slate-50 to-white border-slate-200">
              <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-2 rounded font-semibold transition ${
                    activeTab === 'login' 
                      ? 'bg-white text-primary shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setActiveTab('signup')}
                  className={`flex-1 py-2 rounded font-semibold transition ${
                    activeTab === 'signup' 
                      ? 'bg-white text-primary shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Join Now
                </button>
              </div>

              {activeTab === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">{error}</div>}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-2">Email</label>
                    <Input
                      type="email"
                      placeholder="you@college.edu"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-2">Password</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="bg-white"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm border border-blue-200">
                    <p className="font-semibold text-blue-900 mb-2">Demo Accounts:</p>
                    <p className="text-xs text-blue-800 mb-1"><strong>Driver:</strong> alex.johnson@college.edu</p>
                    <p className="text-xs text-blue-800"><strong>Rider:</strong> emma.wilson@college.edu</p>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                  {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">{error}</div>}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-2">Full Name</label>
                    <Input
                      placeholder="John Doe"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-2">College Email</label>
                    <Input
                      type="email"
                      placeholder="you@college.edu"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-2">Password</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-2">Gender</label>
                    <select
                      value={signupGender}
                      onChange={(e) => setSignupGender(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="other">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-primary/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="p-6 bg-white text-center">
              <div className="text-3xl font-bold text-primary mb-2">1.3K kg</div>
              <div className="text-sm text-slate-600">CO₂ Emissions Saved</div>
            </Card>
            <Card className="p-6 bg-white text-center">
              <div className="text-3xl font-bold text-primary mb-2">10k+</div>
              <div className="text-sm text-slate-600">Rides Completed</div>
            </Card>
            <Card className="p-6 bg-white text-center">
              <div className="text-3xl font-bold text-primary mb-2">100%</div>
              <div className="text-sm text-slate-600">Verified Users</div>
            </Card>
            <Card className="p-6 bg-white text-center">
              <div className="text-3xl font-bold text-primary mb-2">4.8★</div>
              <div className="text-sm text-slate-600">Average Rating</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Find Your Ride Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-slate-900">Find Your Ride in Seconds</h2>
          
          <Card className="p-6 mb-8 bg-white">
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">From</label>
                <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg border border-slate-200">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                  <input type="text" placeholder="Pickup location" className="bg-transparent outline-none flex-1 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">To</label>
                <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg border border-slate-200">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                  <input type="text" placeholder="Campus" className="bg-transparent outline-none flex-1 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">When</label>
                <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg border border-slate-200">
                  <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                  <input type="date" className="bg-transparent outline-none flex-1 text-sm" />
                </div>
              </div>
              <div className="flex items-end">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white">Search Rides</Button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700">Available Rides</h3>
              {[
                { driver: 'Rahul K.', rating: 4.9, car: 'Honda City', seats: 2, price: '₹60' },
                { driver: 'Priya S.', rating: 4.8, car: 'Hyundai i20', seats: 3, price: '₹45', femaleOnly: true },
                { driver: 'Aditya M.', rating: 4.7, car: 'Maruti Swift', seats: 1, price: '₹50' },
              ].map((ride, i) => (
                <Card key={i} className="p-4 flex items-center justify-between hover:shadow-md transition-shadow bg-slate-50 border-slate-200">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users2 className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{ride.driver}</span>
                        {ride.femaleOnly && <Shield className="w-4 h-4 text-pink-500" />}
                      </div>
                      <div className="text-sm text-slate-500">{ride.car} • ⭐ {ride.rating}</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-semibold text-primary mb-1">{ride.price}</div>
                    <div className="text-sm text-slate-500">{ride.seats} seats left</div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Impact Dashboard */}
      <section id="impact" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-slate-900">Your Impact Dashboard</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-8 bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-amber-700 font-semibold mb-2">Energy Saved</div>
                  <div className="text-4xl font-bold text-amber-900">42 kWh</div>
                </div>
                <Zap className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </Card>
            <Card className="p-8 bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-green-700 font-semibold mb-2">CO₂ Reduction</div>
                  <div className="text-4xl font-bold text-green-900">156 kg</div>
                </div>
                <Leaf className="w-12 h-12 text-green-600 opacity-20" />
              </div>
            </Card>
            <Card className="p-8 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-blue-700 font-semibold mb-2">Money Saved</div>
                  <div className="text-4xl font-bold text-blue-900">₹4.5K</div>
                </div>
                <TrendingUp className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </Card>
          </div>

          <Card className="p-8 bg-slate-900">
            <div className="text-white">
              <h3 className="text-2xl font-bold mb-4">Track Your Impact</h3>
              <p className="text-slate-300 mb-6">Every ride contributes to a greener campus. Together we're building a sustainable future.</p>
              <div className="bg-slate-800/50 p-6 rounded-lg">
                <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5 rounded flex items-end justify-center p-4 gap-1">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="flex-1 h-20 bg-primary/40 rounded-t" style={{ height: `${Math.random() * 100 + 20}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-slate-900">Why Choose Hopper?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: 'Verified Community', desc: 'All members verified through college email. Safe rides with trusted peers.' },
              { icon: MapPin, title: 'Real-Time Tracking', desc: 'Know exactly where your driver is. Share live location for safety.' },
              { icon: Leaf, title: 'Eco-Friendly', desc: 'Every shared ride reduces emissions. Track your environmental impact.' },
              { icon: TrendingUp, title: 'Save Money', desc: 'Split costs with other riders. Drivers earn extra income.' },
              { icon: Zap, title: 'Instant Booking', desc: 'Find and book rides in seconds. Pay via wallet or card.' },
              { icon: MessageCircle, title: 'In-Ride Chat', desc: 'Message drivers and riders before and during your trip.' },
            ].map((feature, i) => {
              const Icon = feature.icon
              return (
                <Card key={i} className="p-6 hover:shadow-lg hover:border-primary/30 transition-all">
                  <div className="text-primary mb-4"><Icon className="w-8 h-8" /></div>
                  <h3 className="font-semibold text-lg mb-2 text-slate-900">{feature.title}</h3>
                  <p className="text-slate-600">{feature.desc}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-slate-900">Ready to Hop On?</h2>
          <p className="text-xl text-slate-600 mb-8">Join thousands of students sharing smarter, safer rides.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button 
              onClick={() => setActiveTab('signup')}
              className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition flex items-center gap-2"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              className="px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.svg" alt="Hopper" className="w-8 h-8" />
                <span className="font-bold">Hopper</span>
              </div>
              <p className="text-slate-400 text-sm">Making campus commutes smarter and greener.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">For Riders</a></li>
                <li><a href="#" className="hover:text-white transition">For Drivers</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Safety</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; 2024 Hopper. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
