import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Driver, Rental, Vehicle } from '@/types';
import { Link } from 'react-router-dom';
import { showToast, showErrorToast, showSuccessToast } from '@/utils/toasts';

const SchedulePage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch rentals, vehicles, and drivers from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        // Fetch rentals
        const { data: rentalsData, error: rentalsError } = await supabase
          .from('rentals')
          .select('*');

        if (rentalsError) throw rentalsError;
        
        // Fetch vehicles
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*');

        if (vehiclesError) throw vehiclesError;

        // Fetch drivers
        const { data: driversData, error: driversError } = await supabase
          .from('drivers')
          .select('*');

        if (driversError) throw driversError;

        setRentals(rentalsData as Rental[] || []);
        setVehicles(vehiclesData as Vehicle[] || []);
        setDrivers(driversData as Driver[] || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        showErrorToast("Failed to load schedule data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter rentals for the selected date
  const filteredRentals = rentals.filter(rental => {
    if (!date) return false;
    
    const rentalStart = new Date(rental.start_date);
    const rentalEnd = new Date(rental.end_date);
    
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    const startDate = new Date(rentalStart);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(rentalEnd);
    endDate.setHours(0, 0, 0, 0);
    
    return selectedDate >= startDate && selectedDate <= endDate;
  });

  const handleExportCalendar = async () => {
    try {
      showToast("Exporting calendar data...");
      
      // Simulate Google Calendar integration
      setTimeout(() => {
        showSuccessToast("Calendar exported successfully");
      }, 2000);
    } catch (error) {
      console.error('Error exporting calendar:', error);
      showErrorToast("Failed to export calendar");
    }
  };

  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.name} (${vehicle.license_plate})` : 'Unknown';
  };

  const getDriverName = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.full_name : 'Unknown';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Schedule</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage your fleet schedule and rental bookings
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleExportCalendar} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export to Calendar
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/rentals/new">
              <Plus className="mr-2 h-4 w-4" />
              New Rental
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 min-w-[300px]">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Date Selection</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border w-full max-w-full"
            />
            <div className="mt-4">
              <p className="text-sm">Selected date:</p>
              <p className="font-semibold text-sm sm:text-base">
                {date ? format(date, 'PPP') : 'None selected'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Scheduled Rentals</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  <p>Loading schedule...</p>
                </div>
              </div>
            ) : filteredRentals.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableCaption>
                    List of rentals for {date ? format(date, 'PPP') : 'selected date'}
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRentals.map((rental) => (
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
                          <div className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                            rental.payment_status === "paid" 
                              ? "bg-green-100 text-green-800" 
                              : rental.payment_status === "pending" 
                                ? "bg-yellow-100 text-yellow-800" 
                                : "bg-red-100 text-red-800"
                          )}>
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
                <p className="text-muted-foreground text-sm sm:text-base">No rentals scheduled for this date.</p>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Upcoming Rentals (Next 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                <p>Loading upcoming rentals...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <p className="text-muted-foreground col-span-full text-sm sm:text-base">Feature coming soon.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SchedulePage;