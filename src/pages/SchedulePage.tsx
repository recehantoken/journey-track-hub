import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { formatISO, format, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { Driver, Rental, Vehicle, GoogleCalendarEvent, Setting, PaymentStatus } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SchedulePage = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    renter_name: '',
    renter_phone: '',
    destination: '',
    vehicle_id: '',
    driver_id: '',
    start_date: formatISO(new Date()),
    end_date: formatISO(new Date()),
    payment_status: 'pending' as PaymentStatus,
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('settings')
          .select('*');
          
        if (settingsError) throw settingsError;
        
        // Fetch vehicles
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('status', 'available');
          
        if (vehiclesError) throw vehiclesError;
        
        // Fetch drivers
        const { data: driversData, error: driversError } = await supabase
          .from('drivers')
          .select('*')
          .eq('status', 'active');
          
        if (driversError) throw driversError;
        
        // Fetch rentals
        const { data: rentalsData, error: rentalsError } = await supabase
          .from('rentals')
          .select('*, vehicle:vehicles(*), driver:drivers(*)');
          
        if (rentalsError) throw rentalsError;
        
        setSettings(settingsData || []);
        setVehicles(vehiclesData || []);
        setDrivers(driversData || []);
        setRentals(rentalsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast("Failed to load schedule data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Function to seed sample data
  const seedSampleData = async () => {
    try {
      // Sample rental data
      const sampleRental = {
        renter_name: 'John Doe',
        renter_phone: '+1234567890',
        destination: 'Airport',
        vehicle_id: vehicles[0]?.id || '',
        driver_id: drivers[0]?.id || '',
        start_date: formatISO(new Date()),
        end_date: formatISO(new Date(Date.now() + 3600000 * 24)),
        payment_status: 'pending' as PaymentStatus
      };
      
      // Insert sample rental
      const { data, error } = await supabase
        .from('rentals')
        .insert(sampleRental)
        .select();
        
      if (error) throw error;
      
      if (data) {
        toast("Sample data created successfully");
        // Refresh rentals
        const { data: rentalsData } = await supabase
          .from('rentals')
          .select('*, vehicle:vehicles(*), driver:drivers(*)');
          
        if (rentalsData) {
          setRentals(rentalsData);
        }
      }
    } catch (error) {
      console.error('Error seeding data:', error);
      toast("Failed to create sample data", {
        variant: "destructive"
      });
    }
  };
  
  // Handle booking form submit
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Insert new rental
      const { data, error } = await supabase
        .from('rentals')
        .insert({
          renter_name: formData.renter_name,
          renter_phone: formData.renter_phone,
          destination: formData.destination,
          vehicle_id: formData.vehicle_id,
          driver_id: formData.driver_id,
          start_date: formData.start_date,
          end_date: formData.end_date,
          payment_status: formData.payment_status as PaymentStatus
        })
        .select();
        
      if (error) throw error;
      
      if (data) {
        // Add rental to local state
        setRentals([...rentals, { 
          ...data[0], 
          vehicle: vehicles.find(v => v.id === data[0].vehicle_id), 
          driver: drivers.find(d => d.id === data[0].driver_id) 
        }]);
        
        // Update vehicle status
        await supabase
          .from('vehicles')
          .update({ status: 'rented' })
          .eq('id', formData.vehicle_id);
        
        // Update driver status
        await supabase
          .from('drivers')
          .update({ status: 'on-duty' })
          .eq('id', formData.driver_id);
          
        // Sync with Google Calendar
        const calendarId = settings.find(s => s.key === 'google_calendar_id')?.value;
        
        if (calendarId) {
          const vehicle = vehicles.find(v => v.id === formData.vehicle_id);
          const driver = drivers.find(d => d.id === formData.driver_id);
          
          const calendarEvent: GoogleCalendarEvent = {
            summary: `Rental: ${vehicle?.name || 'Unknown Vehicle'} to ${formData.destination}`,
            description: `Renter: ${formData.renter_name}\nPhone: ${formData.renter_phone}\nDriver: ${driver?.full_name || 'Unknown Driver'}`,
            start: {
              dateTime: formData.start_date,
            },
            end: {
              dateTime: formData.end_date,
            }
          };
          
          await supabase.functions.invoke('google-calendar', {
            body: { 
              calendarId, 
              action: 'create',
              event: calendarEvent 
            }
          });
        }
        
        toast("Booking created successfully");
        setOpenBookingDialog(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast("Failed to create booking", {
        variant: "destructive"
      });
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'PPP p');
    } catch {
      return dateString;
    }
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      renter_name: '',
      renter_phone: '',
      destination: '',
      vehicle_id: '',
      driver_id: '',
      start_date: formatISO(new Date()),
      end_date: formatISO(new Date()),
      payment_status: 'pending' as PaymentStatus,
    });
  };
  
  // Delete booking
  const handleDeleteBooking = async (id: string) => {
    try {
      const rentalToDelete = rentals.find(r => r.id === id);
      
      if (!rentalToDelete) return;
      
      // Delete rental
      const { error } = await supabase
        .from('rentals')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update vehicle status if needed
      await supabase
        .from('vehicles')
        .update({ status: 'available' })
        .eq('id', rentalToDelete.vehicle_id);
      
      // Update driver status if needed
      await supabase
        .from('drivers')
        .update({ status: 'active' })
        .eq('id', rentalToDelete.driver_id);
      
      // Remove from Google Calendar
      const calendarId = settings.find(s => s.key === 'google_calendar_id')?.value;
      
      if (calendarId) {
        await supabase.functions.invoke('google-calendar', {
          body: {
            calendarId,
            action: 'delete',
            eventId: id
          }
        });
      }
      
      // Update local state
      setRentals(rentals.filter(rental => rental.id !== id));
      setShowDetails(null);
      toast("Booking deleted successfully");
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast("Failed to delete booking", {
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Schedule</h1>
          <p className="text-muted-foreground">Manage your vehicle rental schedule</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setOpenBookingDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Booking
          </Button>
          {vehicles.length > 0 && drivers.length > 0 && (
            <Button variant="outline" onClick={seedSampleData}>
              Add Sample Data
            </Button>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">Loading...</div>
      ) : (
        <div className="grid gap-6">
          {rentals.length > 0 ? (
            rentals.map(rental => (
              <Card key={rental.id} className="overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between">
                  <div className="p-6 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mb-4">
                      <h3 className="text-lg font-semibold">
                        {rental.vehicle?.name || 'Unknown Vehicle'}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{formatDate(rental.start_date)} - {formatDate(rental.end_date)}</span>
                      </div>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Renter:</p>
                        <p>{rental.renter_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Phone:</p>
                        <p>{rental.renter_phone}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Destination:</p>
                        <p>{rental.destination}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Driver:</p>
                        <p>{rental.driver?.full_name || 'Unknown Driver'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-row sm:flex-col justify-between sm:justify-center gap-2 bg-slate-50">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowDetails(showDetails === rental.id ? null : rental.id)}
                    >
                      {showDetails === rental.id ? 'Hide Details' : 'View Details'}
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => handleDeleteBooking(rental.id)}
                    >
                      Delete Booking
                    </Button>
                  </div>
                </div>
                
                {showDetails === rental.id && (
                  <CardContent className="bg-slate-50 p-6 border-t">
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium">Vehicle Type:</p>
                        <p className="capitalize">{rental.vehicle?.type || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">License Plate:</p>
                        <p>{rental.vehicle?.license_plate || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Driver Phone:</p>
                        <p>{rental.driver?.phone_number || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Payment Status:</p>
                        <p className="capitalize">{rental.payment_status}</p>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">No bookings found</p>
                <Button onClick={() => setOpenBookingDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Booking
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      {/* Add Booking Dialog */}
      <Dialog open={openBookingDialog} onOpenChange={setOpenBookingDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Booking</DialogTitle>
            <DialogDescription>
              Create a new vehicle rental booking. This will also update the availability of the vehicle and driver.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="renter_name">Renter Name</Label>
                <Input
                  id="renter_name"
                  value={formData.renter_name}
                  onChange={(e) => setFormData({ ...formData, renter_name: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="renter_phone">Renter Phone</Label>
                <Input
                  id="renter_phone"
                  value={formData.renter_phone}
                  onChange={(e) => setFormData({ ...formData, renter_phone: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="vehicle">Vehicle</Label>
                  <Select
                    value={formData.vehicle_id}
                    onValueChange={(value) => setFormData({ ...formData, vehicle_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.name} ({vehicle.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="driver">Driver</Label>
                  <Select
                    value={formData.driver_id}
                    onValueChange={(value) => setFormData({ ...formData, driver_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.start_date ? format(parseISO(formData.start_date), 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={parseISO(formData.start_date)}
                        onSelect={(date) => date && setFormData({ ...formData, start_date: formatISO(date) })}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="grid gap-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.end_date ? format(parseISO(formData.end_date), 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={parseISO(formData.end_date)}
                        onSelect={(date) => date && setFormData({ ...formData, end_date: formatISO(date) })}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenBookingDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Create Booking
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchedulePage;
