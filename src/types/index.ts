
export type VehicleType = 'bus' | 'elf' | 'hi-ace' | 'car';

export type VehicleStatus = 'available' | 'rented' | 'service';

export type DriverStatus = 'active' | 'on-duty' | 'off';

export type PaymentStatus = 'paid' | 'pending' | 'failed';

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  licensePlate: string;
  seats: number;
  photoUrl: string;
  status: VehicleStatus;
  currentLocation?: {
    lat: number;
    lng: number;
  };
}

export interface Driver {
  id: string;
  fullName: string;
  phoneNumber: string;
  photoUrl: string;
  status: DriverStatus;
}

export interface Rental {
  id: string;
  renterName: string;
  renterPhone: string;
  vehicleId: string;
  driverId: string | null;
  startDate: string;
  endDate: string;
  destination: string;
  paymentStatus: PaymentStatus;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

export interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  rentedVehicles: number;
  inServiceVehicles: number;
  totalDrivers: number;
  activeDrivers: number;
  onDutyDrivers: number;
  offDrivers: number;
  totalRentals: number;
  activeRentals: number;
}
