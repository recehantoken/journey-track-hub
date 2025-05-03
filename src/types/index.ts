
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
  type: 'bus' | 'elf' | 'hi-ace' | 'car';
  seats: number;
  status: 'available' | 'rented' | 'service';
  photo_url?: string;
  current_location_lat?: number;
  current_location_lng?: number;
  created_at: string;
  updated_at?: string;
}

export interface Driver {
  id: string;
  full_name: string;
  phone_number: string;
  photo_url?: string;
  status: 'active' | 'on-duty' | 'off';
  created_at: string;
  updated_at?: string;
}

export interface Rental {
  id: string;
  vehicle_id: string;
  driver_id: string;
  renter_name: string;
  renter_phone: string;
  destination: string;
  start_date: string;
  end_date: string;
  payment_status: 'paid' | 'pending' | 'cancelled';
  created_at: string;
  updated_at?: string;
  // These are optional fields for join queries
  vehicle?: Vehicle;
  driver?: Driver;
}

export interface TrackingData {
  id: string;
  vehicle_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  rental_id?: string;
}

export type PaymentStatus = 'paid' | 'pending' | 'cancelled';

// Type for NavBar component props
export interface NavbarProps {
  toggle?: () => void;
  isOpen?: boolean;
}
