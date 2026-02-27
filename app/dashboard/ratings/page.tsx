'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Rating } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'

interface RatingForm {
  rating: number
  comment: string
}

export default function RatingsPage() {
  const { user } = useAuth()
  const [receivedRatings, setReceivedRatings] = useState<Rating[]>([])
  const [givenRatings, setGivenRatings] = useState<Rating[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('received')
  const { register, handleSubmit, reset } = useForm<RatingForm>()

  useEffect(() => {
    fetchRatings()
  }, [user])

  const fetchRatings = async () => {
    if (!user) return
    setIsLoading(true)

    try {
      // Ratings received
      const { data: received } = await supabase
        .from('ratings')
        .select('*')
        .eq('to_user_id', user.id)
        .order('created_at', { ascending: false })

      // Ratings given
      const { data: given } = await supabase
        .from('ratings')
        .select('*')
        .eq('from_user_id', user.id)
        .order('created_at', { ascending: false })

      setReceivedRatings(received || [])
      setGivenRatings(given || [])
    } catch (error) {
      console.error('Error fetching ratings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmitRating = async (data: RatingForm) => {
    if (!user) return

    try {
      await supabase.from('ratings').insert([
        {
          from_user_id: user.id,
          to_user_id: '', // Would be from booking context
          ride_id: '', // Would be from booking context
          rating: data.rating,
          comment: data.comment,
        },
      ])

      reset()
      alert('Rating submitted successfully!')
      fetchRatings()
    } catch (error: any) {
      alert('Error submitting rating: ' + error.message)
    }
  }

  const averageRating =
    receivedRatings.length > 0
      ? (receivedRatings.reduce((sum, r) => sum + r.rating, 0) / receivedRatings.length).toFixed(1)
      : '0.0'

  const RatingItem = ({ rating, isReceived }: { rating: Rating; isReceived: boolean }) => (
    <div key={rating.id} className="border rounded-lg p-4 mb-3">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-sm">
            Rated {rating.rating}/5 {!isReceived && 'to a user'}
          </p>
          <p className="text-xs text-foreground/60">
            {new Date(rating.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              className={i < rating.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}
            />
          ))}
        </div>
      </div>
      {rating.comment && <p className="text-sm text-foreground/70">{rating.comment}</p>}
    </div>
  )

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Ratings & Reviews</h1>
        <p className="text-foreground/60">View your ratings and feedback from other users</p>
      </div>

      {/* Overview Card */}
      <Card className="mb-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="pt-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground/60 mb-2">Average Rating</p>
              <div className="flex items-center gap-2">
                <h2 className="text-4xl font-bold">{averageRating}</h2>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={24}
                      className={
                        i < Math.round(parseFloat(averageRating))
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-gray-300'
                      }
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-foreground/60 mt-2">
                Based on {receivedRatings.length} rating{receivedRatings.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Write a Review</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Write a Review</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmitRating)} className="space-y-4">
                  <div>
                    <Label>Rating</Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Button
                          key={rating}
                          type="button"
                          variant="outline"
                          onClick={() => {}}
                          className="p-2"
                        >
                          <Star size={20} />
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="comment">Comment</Label>
                    <Textarea
                      id="comment"
                      placeholder="Share your experience..."
                      {...register('comment')}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Submit Review
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2 font-semibold text-sm border-b-2 transition ${
            activeTab === 'received'
              ? 'border-primary text-primary'
              : 'border-transparent text-foreground/60'
          }`}
        >
          Received ({receivedRatings.length})
        </button>
        <button
          onClick={() => setActiveTab('given')}
          className={`px-4 py-2 font-semibold text-sm border-b-2 transition ${
            activeTab === 'given'
              ? 'border-primary text-primary'
              : 'border-transparent text-foreground/60'
          }`}
        >
          Given ({givenRatings.length})
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <p className="text-center py-8">Loading ratings...</p>
      ) : activeTab === 'received' ? (
        <div>
          {receivedRatings.length > 0 ? (
            receivedRatings.map((rating) => <RatingItem key={rating.id} rating={rating} isReceived />)
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="mx-auto mb-3 text-foreground/40" size={32} />
                <p className="text-foreground/60">No ratings received yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div>
          {givenRatings.length > 0 ? (
            givenRatings.map((rating) => <RatingItem key={rating.id} rating={rating} isReceived={false} />)
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="mx-auto mb-3 text-foreground/40" size={32} />
                <p className="text-foreground/60">No ratings given yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
