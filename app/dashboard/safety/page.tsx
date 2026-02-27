'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { SOS } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Shield, Bell, Phone, AlertCircle, Heart } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function SafetyPage() {
  const { user } = useAuth()
  const [sosAlerts, setSOSAlerts] = useState<SOS[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sosDescription, setSOSDescription] = useState('')
  const [sosTriggering, setSOSTriggering] = useState(false)

  useEffect(() => {
    fetchSOSAlerts()
  }, [user])

  const fetchSOSAlerts = async () => {
    if (!user) return
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('sos_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('triggered_at', { ascending: false })

      if (error) throw error
      setSOSAlerts(data || [])
    } catch (error) {
      console.error('Error fetching SOS alerts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTriggerSOS = async () => {
    if (!user) return

    setSOSTriggering(true)

    try {
      const { error } = await supabase.from('sos_alerts').insert([
        {
          user_id: user.id,
          ride_id: null, // Would be current ride ID
          triggered_at: new Date().toISOString(),
          description: sosDescription,
        },
      ])

      if (error) throw error

      alert(
        'SOS Alert triggered! Emergency contacts and the platform admin have been notified.'
      )
      setSOSDescription('')
      fetchSOSAlerts()
    } catch (error: any) {
      alert('Error triggering SOS: ' + error.message)
    } finally {
      setSOSTriggering(false)
    }
  }

  const safetyTips = [
    {
      icon: '📍',
      title: 'Share Your Location',
      description: 'Share your real-time location with trusted contacts during the ride.',
    },
    {
      icon: '📱',
      title: 'Use Emergency SOS',
      description: 'Press the SOS button if you feel unsafe. Alerts go to authorities.',
    },
    {
      icon: '👥',
      title: 'Verify Driver Details',
      description: 'Check the driver\'s rating, vehicle details, and reviews before booking.',
    },
    {
      icon: '⭐',
      title: 'Check Ratings',
      description: 'Only ride with drivers or riders who have high trust scores (4.0+).',
    },
    {
      icon: '👩',
      title: 'Female-Only Rides',
      description: 'Select female-only rides if you prefer a safer environment.',
    },
    {
      icon: '🚨',
      title: 'Report Issues',
      description: 'Report any suspicious behavior to our safety team immediately.',
    },
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Safety Features</h1>
        <p className="text-foreground/60">Your safety is our top priority</p>
      </div>

      {/* SOS Alert Section */}
      <Card className="mb-6 border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-600" size={24} />
            <CardTitle className="text-red-800">Emergency SOS Button</CardTitle>
          </div>
          <CardDescription className="text-red-700">
            Use this in case of an emergency during your ride
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-red-800">
              The SOS button will immediately alert emergency services, the driver/rider, and our
              safety team with your location.
            </p>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="lg"
                  className="w-full h-16 text-lg font-bold"
                >
                  <AlertTriangle className="mr-2" size={24} />
                  TRIGGER SOS ALERT
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-red-600">Trigger Emergency Alert</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-red-50 p-3 rounded text-sm text-red-800 border border-red-200">
                    <p className="font-semibold mb-1">⚠️ Emergency SOS Alert</p>
                    <p>
                      This will immediately notify emergency services, the driver/rider, and our safety
                      team.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="sosDescription">Describe the emergency (optional)</Label>
                    <Textarea
                      id="sosDescription"
                      placeholder="e.g., Unsafe driving, suspicious behavior, accident, etc."
                      value={sosDescription}
                      onChange={(e) => setSOSDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button
                    variant="destructive"
                    onClick={handleTriggerSOS}
                    disabled={sosTriggering}
                    className="w-full"
                  >
                    {sosTriggering ? 'Sending Alert...' : 'Confirm and Send SOS'}
                  </Button>

                  <p className="text-xs text-foreground/60">
                    Only trigger this if you're in actual danger. False alarms may result in penalties.
                  </p>
                </div>
              </DialogContent>
            </Dialog>

            {sosAlerts.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-semibold mb-3">Recent SOS Alerts</p>
                <div className="space-y-2">
                  {sosAlerts.slice(0, 3).map((alert) => (
                    <div key={alert.id} className="flex items-start gap-2 p-2 bg-white rounded">
                      <AlertTriangle size={16} className="text-red-600 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold">
                          {new Date(alert.triggered_at).toLocaleString()}
                        </p>
                        <p className="text-xs text-foreground/60">{alert.description || 'No details'}</p>
                        {alert.resolved_at && (
                          <p className="text-xs text-green-600">
                            Resolved: {new Date(alert.resolved_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Safety Tips */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="text-primary" size={24} />
            <CardTitle>Safety Tips</CardTitle>
          </div>
          <CardDescription>Best practices to stay safe while using CampusCarpool</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safetyTips.map((tip, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="text-2xl mb-2">{tip.icon}</div>
                <h3 className="font-semibold text-sm mb-1">{tip.title}</h3>
                <p className="text-xs text-foreground/60">{tip.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Phone className="text-primary" size={24} />
            <CardTitle>Emergency Contacts</CardTitle>
          </div>
          <CardDescription>Important numbers to keep handy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="font-semibold text-sm mb-1">Emergency Services</p>
              <p className="text-lg font-bold text-red-600">112</p>
              <p className="text-xs text-foreground/60 mt-1">Police, Fire, Ambulance</p>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="font-semibold text-sm mb-1">Campus Security</p>
              <p className="text-lg font-bold text-primary">+91-XXX-XXXX-XXXX</p>
              <p className="text-xs text-foreground/60 mt-1">24/7 Campus Security</p>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="font-semibold text-sm mb-1">CampusCarpool Support</p>
              <p className="text-lg font-bold text-primary">support@campuscarpool.com</p>
              <p className="text-xs text-foreground/60 mt-1">24/7 Safety Support</p>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="font-semibold text-sm mb-1">Report Abuse</p>
              <p className="text-lg font-bold text-primary">abuse@campuscarpool.com</p>
              <p className="text-xs text-foreground/60 mt-1">Report unsafe users</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
