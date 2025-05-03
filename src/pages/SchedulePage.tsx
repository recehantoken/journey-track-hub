
import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { Rental, Vehicle, Driver, GoogleCalendarEvent } from '@/types';
import { format, parse, addHours, isFuture, isToday, isBefore } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  rentalId?: string;
  vehicleName?: string;
  driverName?: string;
  googleCalendarEventId?: string;
};

const SchedulePage = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  const [formData, setFormData] = useState({
    id: '',
    renter_name: '',
    renter_phone: '',
    destination: '',
    vehicle_id: '',
    driver_id: '',
    start_date: '',
    end_date: '',
    payment_status: 'pending' as const
  });

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch rentals
        const { data: rentalsData, error: rentalsError } = await supabase
          .from('rentals')
          .select(`
            *,
            vehicle:vehicles(*),
            driver:drivers(*)
          `)
          .order('start_date', { ascending: true });
        
        if (rentalsError) throw rentalsError;
        
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
        
        // Update state
        if (rentalsData) setRentals(rentalsData);
        if (vehiclesData) setVehicles(vehiclesData);
        if (driversData) setDrivers(driversData);
        
        // Convert rentals to calendar events
        const calendarEvents = rentalsData.map((rental) => ({
          id: rental.id,
          title: `${rental.renter_name} to ${rental.destination}`,
          start: new Date(rental.start_date),
          end: new Date(rental.end_date),
          rentalId: rental.id,
          vehicleName: rental.vehicle?.name || 'No vehicle',
          driverName: rental.driver?.full_name || 'No driver'
        }));
        
        setEvents(calendarEvents);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          description: "Failed to fetch data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Get filtered events for selected date
  const filteredEvents = useMemo(() => {
    return events.filter(event => 
      isToday(event.start, date) || 
      isToday(event.end, date) || 
      (isBefore(event.start, date) && isFuture(event.end))
    );
  }, [events, date]);
  
  const handleAddBooking = () => {
    setFormData({
      id: '',
      renter_name: '',
      renter_phone: '',
      destination: '',
      vehicle_id: '',
      driver_id: '',
      start_date: format(date, "yyyy-MM-dd'T'HH:mm"),
      end_date: format(addHours(date, 3), "yyyy-MM-dd'T'HH:mm"),
      payment_status: 'pending'
    });
    setOpenDialog(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Insert rental into database
      const { data, error } = await supabase
        .from('rentals')
        .insert([formData])
        .select()
        .single();
      
      if (error) throw error;
      
      // Create Google Calendar event
      const createCalendarEvent = async (rental: Rental) => {
        try {
          setSyncing(true);
          
          const vehicle = vehicles.find(v => v.id === rental.vehicle_id);
          const driver = drivers.find(d => d.id === rental.driver_id);
          
          const calendarEvent: GoogleCalendarEvent = {
            summary: `Rental: ${rental.renter_name} to ${rental.destination}`,
            description: `
              Renter: ${rental.renter_name}
              Phone: ${rental.renter_phone}
              Vehicle: ${vehicle?.name || 'N/A'} (${vehicle?.license_plate || 'N/A'})
              Driver: ${driver?.full_name || 'N/A'}
              Payment Status: ${rental.payment_status}
              Rental ID: ${rental.id}
            `,
            location: rental.destination,
            start: {
              dateTime: rental.start_date,
              timeZone: 'Asia/Jakarta'
            },
            end: {
              dateTime: rental.end_date,
              timeZone: 'Asia/Jakarta'
            }
          };
          
          const { data: calendarData, error: calendarError } = await supabase.functions.invoke('google-calendar', {
            method: 'POST',
            body: { action: 'create', event: calendarEvent }
          });
          
          if (calendarError) throw calendarError;
          
          toast({
            description: "The booking has been added to Google Calendar"
          });
        } catch (error) {
          console.error('Error creating calendar event:', error);
          toast({
            description: "Failed to sync with Google Calendar",
            variant: "destructive"
          });
        } finally {
          setSyncing(false);
        }
      };
      
      if (data) {
        createCalendarEvent(data);
        
        // Update events state
        const newEvent: CalendarEvent = {
          id: data.id,
          title: `${data.renter_name} to ${data.destination}`,
          start: new Date(data.start_date),
          end: new Date(data.end_date),
          rentalId: data.id,
          vehicleName: vehicles.find(v => v.id === data.vehicle_id)?.name || 'No vehicle',
          driverName: drivers.find(d => d.id === data.driver_id)?.full_name || 'No driver'
        };
        
        setEvents([...events, newEvent]);
      }
      
      setOpenDialog(false);
      
      toast({
        description: "New rental has been created successfully"
      });
      
      // Update vehicle status to 'rented'
      await supabase
        .from('vehicles')
        .update({ status: 'rented' })
        .eq('id', formData.vehicle_id);
      
      // Update driver status to 'on-duty'
      await supabase
        .from('drivers')
        .update({ status: 'on-duty' })
        .eq('id', formData.driver_id);
    } catch (error) {
      console.error('Error saving booking:', error);
      toast({
        description: "Failed to create booking",
        variant: "destructive"
      });
    }
  };

  const syncWithGoogleCalendar = async () => {
    setSyncing(true);
    
    try {
      // Fetch events from Google Calendar
      const { data, error } = await supabase.functions.invoke('google-calendar', {
        method: 'GET',
        body: { 
          action: 'list',
          timeMin: new Date().toISOString(),
          timeMax: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      });
      
      if (error) throw error;
      
      if (data && data.success) {
        toast({
          description: `${data.events.length} events synchronized with Google Calendar`
        });
      }
    } catch (error) {
      console.error('Error syncing with Google Calendar:', error);
      toast({
        description: "Failed to sync with Google Calendar",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Booking Schedule</h1>
          <p className="text-muted-foreground">Manage your vehicle rental schedule</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={syncWithGoogleCalendar} disabled={syncing}>
            <CalendarIcon className="h-4 w-4 mr-2" />
            {syncing ? 'Syncing...' : 'Sync with Google Calendar'}
          </Button>
          <Button onClick={handleAddBooking}>
            <Clock className="h-4 w-4 mr-2" />
            New Booking
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              className="rounded-md border w-full"
            />
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              Bookings for {format(date, 'MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading schedule...</p>
            ) : filteredEvents.length > 0 ? (
              <div className="space-y-4">
                {filteredEvents.map(event => (
                  <Card key={event.id} className="overflow-hidden">
                    <div className={`bg-primary h-2 w-full`} />
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{event.title}</h3>
                        <div className="text-sm text-muted-foreground">
                          {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        <div>Vehicle: {event.vehicleName}</div>
                        <div>Driver: {event.driverName}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No bookings scheduled for this day.</p>
                <Button className="mt-4" variant="outline" onClick={handleAddBooking}>
                  Create Booking
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Booking Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Booking</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="renter_name">Renter Name</Label>
                  <Input
                    id="renter_name"
                    name="renter_name"
                    value={formData.renter_name}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="renter_phone">Renter Phone</Label>
                  <Input
                    id="renter_phone"
                    name="renter_phone"
                    value={formData.renter_phone}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="vehicle_id">Vehicle</Label>
                <Select 
                  value={formData.vehicle_id} 
                  onValueChange={(value) => handleSelectChange('vehicle_id', value)}
                >
                  <SelectTrigger id="vehicle_id">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map(vehicle => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.name} - {vehicle.license_plate} ({vehicle.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="driver_id">Driver</Label>
                <Select 
                  value={formData.driver_id} 
                  onValueChange={(value) => handleSelectChange('driver_id', value)}
                >
                  <SelectTrigger id="driver_id">
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map(driver => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.full_name} - {driver.phone_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleFormChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start_date">Start Date & Time</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end_date">End Date & Time</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="payment_status">Payment Status</Label>
                <Select 
                  value={formData.payment_status} 
                  onValueChange={(value) => handleSelectChange('payment_status', value as 'pending' | 'paid' | 'cancelled')}
                >
                  <SelectTrigger id="payment_status">
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Create Booking
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchedulePage;
