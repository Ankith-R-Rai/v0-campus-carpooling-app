'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { User } from '@/lib/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Zap } from 'lucide-react'

export default function LoginPage() {
  const { user, setUser } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Sign up state
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupGender, setSignupGender] = useState<'male' | 'female' | 'other'>('other')

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

  const handleDemoLogin = async (email: string) => {
    setError(null)
    setIsLoading(true)

    try {
      const { data: users, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (fetchError || !users) {
        setError('Demo account not found')
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

  if (user) {
    router.push('/dashboard')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-slate-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <img src="/logo.svg" alt="Hopper" className="w-10 h-10" />
          <h1 className="text-2xl font-bold text-primary">Hopper</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center border-b border-slate-200">
            <CardTitle className="text-3xl font-bold text-slate-900">Welcome to Hopper</CardTitle>
            <CardDescription className="text-base mt-2">Share rides, save money, build community</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100">
                <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                      {error}
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-2">Email Address</label>
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
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>

                {/* Quick Demo Login */}
                <div className="mt-6 space-y-3">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-slate-500 font-medium">Quick Demo</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleDemoLogin('alex.johnson@college.edu')}
                      disabled={isLoading}
                      className="p-3 bg-primary/10 hover:bg-primary/20 text-primary font-semibold rounded-lg transition border border-primary/30 disabled:opacity-50"
                    >
                      <div className="text-xs">Driver Demo</div>
                      <div className="text-xs opacity-70">Alex Johnson</div>
                    </button>
                    <button
                      onClick={() => handleDemoLogin('emma.wilson@college.edu')}
                      disabled={isLoading}
                      className="p-3 bg-primary/10 hover:bg-primary/20 text-primary font-semibold rounded-lg transition border border-primary/30 disabled:opacity-50"
                    >
                      <div className="text-xs">Rider Demo</div>
                      <div className="text-xs opacity-70">Emma Wilson</div>
                    </button>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-800">
                    <div className="font-semibold mb-1 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Fast Demo Login
                    </div>
                    Click either demo account to instantly explore Hopper as a driver or rider.
                  </div>
                </div>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignup} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                      {error}
                    </div>
                  )}
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
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                    >
                      <option value="other">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>

                <p className="text-xs text-center text-slate-600 mt-4">
                  By signing up, you agree to our Terms & Conditions and Privacy Policy
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-slate-600">
          <p>&copy; 2024 Hopper. Making campus commutes smarter and greener.</p>
        </div>
      </footer>
    </div>
  )
}
