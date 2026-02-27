-- Seed demo users
INSERT INTO users (id, name, email, gender, trust_score, wallet_balance, role_toggle, vehicle_model, license_plate, total_rides_given, total_rides_taken)
VALUES
  ('d5a7e1a0-1b2c-4d5e-8f9a-0b1c2d3e4f5a'::uuid, 'Alex Johnson', 'alex.johnson@college.edu', 'male', 4.8, 150.50, 'driver', 'Honda Civic', 'ABC123', 12, 3),
  ('d5a7e1a0-1b2c-4d5e-8f9a-0b1c2d3e4f5b'::uuid, 'Sarah Chen', 'sarah.chen@college.edu', 'female', 4.9, 200.00, 'driver', 'Toyota Prius', 'ECO456', 8, 5),
  ('d5a7e1a0-1b2c-4d5e-8f9a-0b1c2d3e4f5c'::uuid, 'Mike Davis', 'mike.davis@college.edu', 'male', 4.6, 175.25, 'driver', 'Ford Focus', 'BLU789', 15, 2),
  ('d5a7e1a0-1b2c-4d5e-8f9a-0b1c2d3e4f5d'::uuid, 'Emma Wilson', 'emma.wilson@college.edu', 'female', 5.0, 250.00, 'rider', NULL, NULL, 0, 10),
  ('d5a7e1a0-1b2c-4d5e-8f9a-0b1c2d3e4f5e'::uuid, 'Demo User', 'demo@college.edu', 'male', 5.0, 500.00, 'rider', NULL, NULL, 0, 0);

-- Seed demo rides
INSERT INTO rides (id, driver_id, start_location, destination, date_time, seats_total, seats_available, female_only, vibe, status)
VALUES
  ('r1a7e1a0-1b2c-4d5e-8f9a-0b1c2d3e4f5a'::uuid, 'd5a7e1a0-1b2c-4d5e-8f9a-0b1c2d3e4f5a'::uuid, 'Main Library', 'Campus', '2026-02-27 08:30:00', 3, 2, false, 'Music', 'scheduled'),
  ('r1a7e1a0-1b2c-4d5e-8f9a-0b1c2d3e4f5b'::uuid, 'd5a7e1a0-1b2c-4d5e-8f9a-0b1c2d3e4f5b'::uuid, 'Downtown Station', 'Campus', '2026-02-27 09:00:00', 2, 2, true, 'Networking', 'scheduled'),
  ('r1a7e1a0-1b2c-4d5e-8f9a-0b1c2d3e4f5c'::uuid, 'd5a7e1a0-1b2c-4d5e-8f9a-0b1c2d3e4f5c'::uuid, 'North Parking', 'Campus', '2026-02-27 10:15:00', 4, 3, false, 'Silent', 'scheduled'),
  ('r1a7e1a0-1b2c-4d5e-8f9a-0b1c2d3e4f5d'::uuid, 'd5a7e1a0-1b2c-4d5e-8f9a-0b1c2d3e4f5a'::uuid, 'West Avenue', 'Campus', '2026-02-27 14:00:00', 3, 1, false, 'Music', 'scheduled'),
  ('r1a7e1a0-1b2c-4d5e-8f9a-0b1c2d3e4f5e'::uuid, 'd5a7e1a0-1b2c-4d5e-8f9a-0b1c2d3e4f5b'::uuid, 'Student Center', 'Campus', '2026-02-27 16:30:00', 2, 1, true, 'Silent', 'scheduled');

-- Seed sample bookings
INSERT INTO bookings (ride_id, rider_id, seats_booked, status)
VALUES
  ('r1a7e1a0-1b2c-4d5e-8f9a-0b1c2d3e4f5a'::uuid, 'd5a7e1a0-1b2c-4d5e-8f9a-0b1c2d3e4f5d'::uuid, 1, 'approved'),
  ('r1a7e1a0-1b2c-4d5e-8f9a-0b1c2d3e4f5b'::uuid, 'd5a7e1a0-1b2c-4d5e-8f9a-0b1c2d3e4f5d'::uuid, 1, 'pending');

-- Seed sample transactions
INSERT INTO transactions (user_id, amount, type, ride_id, description)
VALUES
  ('d5a7e1a0-1b2c-4d5e-8f9a-0b1c2d3e4f5a'::uuid, 50.00, 'credit', 'r1a7e1a0-1b2c-4d5e-8f9a-0b1c2d3e4f5a'::uuid, 'Ride completion bonus'),
  ('d5a7e1a0-1b2c-4d5e-8f9a-0b1c2d3e4f5d'::uuid, 8.50, 'debit', 'r1a7e1a0-1b2c-4d5e-8f9a-0b1c2d3e4f5a'::uuid, 'Ride payment');
