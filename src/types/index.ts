export interface Vehicle {
  id: string;
  name: string;
  type: string;
  licensePlate: string;
  seats: number;
  photoUrl: string | null;
  status: string;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  current_location_lat?: number | null;
  current_location_lng?: number | null;
}

export interface Driver {
  id: string;
  fullName: string;
  phoneNumber: string;
  photoUrl: string | null;
  status: DriverStatus;
}

// Define proper driver status values to match the database constraint
export type DriverStatus = 'active' | 'on-duty' | 'off';
