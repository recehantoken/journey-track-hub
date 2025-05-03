
export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  license_plate: string;
  licensePlate?: string; // For backward compatibility
  seats: number;
  photo_url: string | null;
  photoUrl?: string | null; // For backward compatibility
  status: VehicleStatus;
  current_location_lat?: number | null;
  current_location_lng?: number | null;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  created_at?: string;
  updated_at?: string;
}

export interface Driver {
  id: string;
  full_name: string;
  fullName?: string; // For backward compatibility
  phone_number: string;
  phoneNumber?: string; // For backward compatibility
  photo_url: string | null;
  photoUrl?: string | null; // For backward compatibility
  status: DriverStatus;
  created_at?: string;
  updated_at?: string;
}

export interface Rental {
  id: string;
  renter_name: string;
  renter_phone: string;
  destination: string;
  vehicle_id: string;
  driver_id: string;
  start_date: string;
  end_date: string;
  payment_status: PaymentStatus;
  created_at?: string;
  updated_at?: string;
  // Backward compatibility
  renterName?: string;
  renterPhone?: string;
  vehicleId?: string;
  driverId?: string;
  startDate?: string;
  endDate?: string;
  paymentStatus?: PaymentStatus;
  // Relationships
  vehicle?: Vehicle;
  driver?: Driver;
}

export interface Profile {
  id: string;
  full_name: string | null;
  role: string | null;
  created_at?: string;
  updated_at?: string;
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
  created_at?: string;
  updated_at?: string;
}

export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    name?: string;
  }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: string;
      minutes: number;
    }>;
  };
}

// Enum types that match Supabase database
export type VehicleType = 'bus' | 'elf' | 'hi-ace' | 'car';
export type VehicleStatus = 'available' | 'rented' | 'service';
export type DriverStatus = 'active' | 'on-duty' | 'off';
export type PaymentStatus = 'pending' | 'paid' | 'cancelled';
