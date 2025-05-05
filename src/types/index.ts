export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'admin' | 'user';
  created_at: string;
}

export type VehicleType = 'bus' | 'elf' | 'hi-ace' | 'car';
export type VehicleStatus = 'available' | 'rented' | 'service';
export type DriverStatus = 'active' | 'on-duty' | 'off';
export type PaymentStatus = 'paid' | 'pending' | 'cancelled';

export interface Vehicle {
  id: string;
  name: string;
  license_plate: string;
  type: VehicleType;
  seats: number;
  status: VehicleStatus;
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
  status: DriverStatus;
  created_at: string;
  updated_at?: string;
}

export interface Rental {
  id: string;
  vehicle_id: string;
  driver_id: string;
  renter_name: string;
  renter_phone: string;
  renter_address: string;
  destination: string;
  start_date: string;
  end_date: string;
  payment_price: number;
  payment_status: string;
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

export interface Setting {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
  category: string;
  created_at: string | null;
  updated_at: string | null;
}

// Type for NavBar component props
export interface NavbarProps {
  toggle?: () => void;
  isOpen?: boolean;
}
