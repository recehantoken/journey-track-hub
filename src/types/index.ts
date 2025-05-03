export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface Vehicle {
  id: string;
  name: string;
  license_plate: string;
  model: string;
  year: number;
  capacity: number;
  status: 'available' | 'in_use' | 'maintenance';
  image_url?: string;
  daily_rate: number;
  created_at: string;
}

export interface Driver {
  id: string;
  full_name: string;
  phone_number: string;
  license_number?: string;
  status: 'available' | 'busy' | 'off_duty';
  avatar_url?: string;
  created_at: string;
}

export interface Rental {
  id: string;
  vehicle_id: string;
  driver_id: string;
  renter_name: string;
  renter_phone: string;
  renter_email?: string;
  start_date: string;
  end_date: string;
  destination: string;
  total_amount: number;
  payment_status: 'paid' | 'pending' | 'cancelled';
  notes?: string;
  created_at: string;
}

export interface TrackingData {
  id: string;
  vehicle_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  rental_id?: string;
}
