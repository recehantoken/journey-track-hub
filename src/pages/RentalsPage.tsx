import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Rental, Vehicle, Driver } from '@/types';
import { showErrorToast } from '@/utils/toasts';

const RentalsPage = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch rentals, vehicles, and drivers
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('Fetching rentals...');
        const { data: rentalsData, error: rentalsError } = await supabase
          .from('rentals')
          .select('*');
        if (rentalsError) {
          console.error('Rentals error:', rentalsError);
          throw rentalsError;
        }
        console.log('Rentals fetched:', rentalsData);

        console.log('Fetching vehicles...');
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*');
        if (vehiclesError) {
          console.error('Vehicles error:', vehiclesError);
          throw vehiclesError;
        }
        console.log('Vehicles fetched:', vehiclesData);

        console.log('Fetching drivers...');
        const { data: driversData, error: driversError } = await supabase
          .from('drivers')
          .select('*');
        if (driversError) {
          console.error('Drivers error:', driversError);
          throw driversError;
        }
        console.log('Drivers fetched:', driversData);

        setRentals(rentalsData as Rental[] || []);
        setVehicles(vehiclesData as Vehicle[] || []);
        setDrivers(driversData as Driver[] || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load rentals. Please try again.');
        showErrorToast('Failed to load rentals');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    return vehicle ? `${vehicle.name} (${vehicle.license_plate})` : 'Unknown';
  };

  const getDriverName = (driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    return driver ? driver.full_name : 'Unknown';
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-red-600">Error</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4 w-full sm:w-auto"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Rentals</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            View and manage all rental bookings
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link to="/rentals/new">
            <Plus className="mr-2 h-4 w-4" />
            New Rental
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Rental List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                <p>Loading rentals...</p>
              </div>
            </div>
          ) : rentals.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>All rental bookings in the system</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Renter</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Payment Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rentals.map((rental) => (
                    <TableRow key={rental.id}>
                      <TableCell>
                        <div className="font-medium">{rental.renter_name}</div>
                        <div className="text-sm text-muted-foreground">{rental.renter_phone}</div>
                      </TableCell>
                      <TableCell>{getVehicleName(rental.vehicle_id)}</TableCell>
                      <TableCell>{getDriverName(rental.driver_id)}</TableCell>
                      <TableCell>{rental.destination}</TableCell>
                      <TableCell>{format(new Date(rental.start_date), 'PPP')}</TableCell>
                      <TableCell>{format(new Date(rental.end_date), 'PPP')}</TableCell>
                      <TableCell>
                        <div
                          className={cn(
                            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                            rental.payment_status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : rental.payment_status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          )}
                        >
                          {rental.payment_status.charAt(0).toUpperCase() + rental.payment_status.slice(1)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-muted-foreground text-sm sm:text-base">No rentals found.</p>
              <Button className="mt-4 w-full sm:w-auto" asChild>
                <Link to="/rentals/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Rental
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RentalsPage;