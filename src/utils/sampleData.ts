
import { supabase } from '@/integrations/supabase/client';
import { Driver, DriverStatus, Vehicle, VehicleType, VehicleStatus, PaymentStatus } from '@/types';

export const seedVehicles = async () => {
  try {
    // First check if we already have vehicles
    const { data: existingVehicles } = await supabase
      .from('vehicles')
      .select('id')
      .limit(1);
    
    if (existingVehicles && existingVehicles.length > 0) {
      console.log('Vehicles already exist in database, skipping seed');
      return;
    }
    
    const vehicles = [
      {
        name: 'Mercedes Sprinter',
        type: 'bus' as VehicleType,
        license_plate: 'BUS-1234',
        seats: 16,
        photo_url: 'https://images.unsplash.com/photo-1566985687382-5b6dc1593dce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        status: 'available' as VehicleStatus,
        current_location_lat: -6.200000,
        current_location_lng: 106.816666,
      },
      {
        name: 'Toyota Hiace',
        type: 'hi-ace' as VehicleType,
        license_plate: 'HAC-5678',
        seats: 12,
        photo_url: 'https://images.unsplash.com/photo-1606147440135-59b015256bbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        status: 'available' as VehicleStatus,
        current_location_lat: -6.210000,
        current_location_lng: 106.826666,
      },
      {
        name: 'Isuzu Elf',
        type: 'elf' as VehicleType,
        license_plate: 'ELF-9012',
        seats: 20,
        photo_url: 'https://images.unsplash.com/photo-1621252728823-917a30c17ec3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        status: 'available' as VehicleStatus,
        current_location_lat: -6.220000,
        current_location_lng: 106.836666,
      },
      {
        name: 'Toyota Avanza',
        type: 'car' as VehicleType,
        license_plate: 'CAR-3456',
        seats: 6,
        photo_url: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1236&q=80',
        status: 'available' as VehicleStatus,
        current_location_lat: -6.230000,
        current_location_lng: 106.846666,
      },
    ];
    
    const { error } = await supabase
      .from('vehicles')
      .insert(vehicles);
      
    if (error) throw error;
    
    console.log('Vehicles seeded successfully');
    return true;
  } catch (error) {
    console.error('Error seeding vehicles:', error);
    return false;
  }
};

export const seedDrivers = async () => {
  try {
    // Check if we already have drivers
    const { data: existingDrivers } = await supabase
      .from('drivers')
      .select('id')
      .limit(1);
    
    if (existingDrivers && existingDrivers.length > 0) {
      console.log('Drivers already exist in database, skipping seed');
      return;
    }
    
    const drivers = [
      {
        full_name: 'John Driver',
        phone_number: '+1234567890',
        photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
        status: 'active' as DriverStatus,
      },
      {
        full_name: 'Sarah Smith',
        phone_number: '+1876543210',
        photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
        status: 'active' as DriverStatus,
      },
      {
        full_name: 'Michael Chen',
        phone_number: '+1122334455',
        photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
        status: 'active' as DriverStatus,
      },
      {
        full_name: 'Emma Rodriguez',
        phone_number: '+1555666777',
        photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=761&q=80',
        status: 'off' as DriverStatus,
      },
    ];
    
    const { error } = await supabase
      .from('drivers')
      .insert(drivers);
      
    if (error) throw error;
    
    console.log('Drivers seeded successfully');
    return true;
  } catch (error) {
    console.error('Error seeding drivers:', error);
    return false;
  }
};

export const seedRentals = async () => {
  try {
    // Check if we already have rentals
    const { data: existingRentals } = await supabase
      .from('rentals')
      .select('id')
      .limit(1);
    
    if (existingRentals && existingRentals.length > 0) {
      console.log('Rentals already exist in database, skipping seed');
      return;
    }
    
    // Get vehicles and drivers to create rentals
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('id')
      .limit(4);
      
    const { data: drivers } = await supabase
      .from('drivers')
      .select('id')
      .limit(4);
      
    if (!vehicles || !drivers || vehicles.length === 0 || drivers.length === 0) {
      throw new Error('No vehicles or drivers found to create rentals');
    }
    
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);
    
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);
    
    const tenDaysFromNow = new Date();
    tenDaysFromNow.setDate(now.getDate() + 10);
    
    const rentals = [
      {
        renter_name: 'Alex Johnson',
        renter_phone: '+1222333444',
        destination: 'Bali, Indonesia',
        vehicle_id: vehicles[0].id,
        driver_id: drivers[0].id,
        start_date: now.toISOString(),
        end_date: threeDaysFromNow.toISOString(),
        payment_status: 'paid' as PaymentStatus,
      },
      {
        renter_name: 'Olivia Williams',
        renter_phone: '+1888999000',
        destination: 'Yogyakarta, Indonesia',
        vehicle_id: vehicles[1].id,
        driver_id: drivers[1].id,
        start_date: threeDaysFromNow.toISOString(),
        end_date: sevenDaysFromNow.toISOString(),
        payment_status: 'pending' as PaymentStatus,
      },
      {
        renter_name: 'James Brown',
        renter_phone: '+1444555666',
        destination: 'Bandung, Indonesia',
        vehicle_id: vehicles[2].id,
        driver_id: drivers[2].id,
        start_date: sevenDaysFromNow.toISOString(),
        end_date: tenDaysFromNow.toISOString(),
        payment_status: 'pending' as PaymentStatus,
      },
    ];
    
    const { error } = await supabase
      .from('rentals')
      .insert(rentals);
      
    if (error) throw error;
    
    // Update status for booked vehicles and drivers
    await supabase
      .from('vehicles')
      .update({ status: 'rented' })
      .eq('id', vehicles[0].id);
      
    await supabase
      .from('drivers')
      .update({ status: 'on-duty' })
      .eq('id', drivers[0].id);
      
    console.log('Rentals seeded successfully');
    return true;
  } catch (error) {
    console.error('Error seeding rentals:', error);
    return false;
  }
};

export const seedDatabase = async () => {
  await seedVehicles();
  await seedDrivers();
  await seedRentals();
};
