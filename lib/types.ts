export interface User {
  id: string
  name: string
  email: string
  gender: 'male' | 'female' | 'other'
  trust_score: number
  wallet_balance: number
  role_toggle: 'driver' | 'rider'
  vehicle_model?: string
  license_plate?: string
  total_rides_given: number
  total_rides_taken: number
  created_at: string
}

export interface Ride {
  id: string
  driver_id: string
  start_location: string
  destination: string
  date_time: string
  seats_total: number
  seats_available: number
  female_only: boolean
  vibe: 'Music' | 'Networking' | 'Silent'
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
  driver?: User
}

export interface Booking {
  id: string
  ride_id: string
  rider_id: string
  seats_booked: number
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'
  created_at: string
  ride?: Ride
  rider?: User
}

export interface Rating {
  id: string
  from_user_id: string
  to_user_id: string
  ride_id: string
  rating: number
  comment: string
  created_at: string
}

export interface SOS {
  id: string
  user_id: string
  ride_id: string
  triggered_at: string
  resolved_at?: string
  location?: string
  description?: string
}

export interface Transaction {
  id: string
  user_id: string
  amount: number
  type: 'credit' | 'debit'
  ride_id?: string
  description: string
  created_at: string
}
