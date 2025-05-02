
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Rental, Driver, Vehicle, PaymentStatus } from '@/types';
import { 
  Plus, 
  Calendar, 
  MapPin, 
  User, 
  Car, 
  Phone,
  Clock,
  CreditCard
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from "@/integrations/supabase/client";

const RentalsPage = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTab, setCurrentTab] = useState('all');
  
  const [formData, setFormData] = useState({
    id: '',
    renter_name: '',
    renter_phone: '',
    vehicle_id: '',
    driver_id: '',
    start_date: '',
    end_date: '',
    destination: '',
    payment_status: 'pending' as PaymentStatus
  });

  useEffect(() => {
    // Fetch data from Supabase
    const fetchData = async () => {
      try {
        // Fetch rentals with related data
        const { data: rentalsData, error: rentalsError } = await supabase
          .from('rentals')
          .select(`
            *,
            vehicle:vehicles(*),
            driver:drivers(*)
          `)
          .order('created_at', { ascending: false });
        
        if (rentalsError) throw rentalsError;
        
        // Fetch available vehicles
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('status', 'available');
          
        if (vehiclesError) throw vehiclesError;
        
        // Fetch available drivers
        const { data: driversData, error: driversError } = await supabase
          .from('drivers')
          .select('*')
          .eq('status', 'active');
          
        if (driversError) throw driversError;
        
        // Update state
        if (rentalsData) setRentals(rentalsData);
        if (vehiclesData) setAvailableVehicles(vehiclesData);
        if (driversData) setAvailableDrivers(driversData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch data from database",
          variant: "destructive"
        });
      }
    };
    
    fetchData();
  }, []);

  const handleAddRental = () => {
    setFormData({
      id: '',
      renter_name: '',
      renter_phone: '',
      vehicle_id: '',
      driver_id: '',
      start_date: '',
      end_date: '',
      destination: '',
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
      // Insert new rental
      const { data, error } = await supabase
        .from('rentals')
        .insert([formData])
        .select();
      
      if (error) throw error;
      
      if (data) {
        // Fetch the complete rental with relationships
        const { data: rentalWithRelations, error: relationsError } = await supabase
          .from('rentals')
          .select(`
            *,
            vehicle:vehicles(*),
            driver:drivers(*)
          `)
          .eq('id', data[0].id)
          .single();
        
        if (relationsError) throw relationsError;
        
        // Update rentals state
        setRentals([rentalWithRelations, ...rentals]);
        
        // Update vehicle status to "rented"
        await supabase
          .from('vehicles')
          .update({ status: 'rented' })
          .eq('id', formData.vehicle_id);
          
        // Update driver status to "on-duty"
        await supabase
          .from('drivers')
          .update({ status: 'on-duty' })
          .eq('id', formData.driver_id);
        
        // Remove vehicle and driver from available lists
        setAvailableVehicles(availableVehicles.filter(v => v.id !== formData.vehicle_id));
        setAvailableDrivers(availableDrivers.filter(d => d.id !== formData.driver_id));
        
        setOpenDialog(false);
        
        toast({
          title: "Rental created",
          description: "New rental has been added to the system",
        });
      }
    } catch (error) {
      console.error('Error creating rental:', error);
      toast({
        title: "Error",
        description: "Failed to create rental",
        variant: "destructive"
      });
    }
  };

  const filteredRentals = rentals.filter(rental => {
    if (currentTab === 'all') return true;
    
    const currentDate = new Date();
    const startDate = new Date(rental.start_date);
    const endDate = new Date(rental.end_date);
    
    if (currentTab === 'active') {
      return currentDate >= startDate && currentDate <= endDate;
    } else if (currentTab === 'upcoming') {
      return startDate > currentDate;
    } else if (currentTab === 'completed') {
      return endDate < currentDate;
    }
    
    return true;
  });

  const updatePaymentStatus = async (rentalId: string, paymentStatus: PaymentStatus) => {
    try {
      const { error } = await supabase
        .from('rentals')
        .update({ payment_status: paymentStatus })
        .eq('id', rentalId);
        
      if (error) throw error;
      
      setRentals(rentals.map(rental => 
        rental.id === rentalId ? { ...rental, payment_status: paymentStatus } : rental
      ));
      
      toast({
        title: "Payment status updated",
        description: `Payment status has been updated to ${paymentStatus}`,
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Rentals</h1>
          <p className="text-muted-foreground">Manage your vehicle rentals</p>
        </div>
        <Button onClick={handleAddRental}>
          <Plus className="h-4 w-4 mr-2" />
          Add Rental
        </Button>
      </div>
      
      <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab}>
        <TabsList>
          <TabsTrigger value="all">All Rentals</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredRentals.map(rental => (
              <RentalCard 
                key={rental.id} 
                rental={rental} 
                onUpdatePayment={updatePaymentStatus}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="active" className="mt-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredRentals.map(rental => (
              <RentalCard 
                key={rental.id} 
                rental={rental} 
                onUpdatePayment={updatePaymentStatus}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="upcoming" className="mt-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredRentals.map(rental => (
              <RentalCard 
                key={rental.id} 
                rental={rental} 
                onUpdatePayment={updatePaymentStatus}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredRentals.map(rental => (
              <RentalCard 
                key={rental.id} 
                rental={rental} 
                onUpdatePayment={updatePaymentStatus}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Rental Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Book New Rental</DialogTitle>
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
                    {availableVehicles.map(vehicle => (
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
                    {availableDrivers.map(driver => (
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
                  onValueChange={(value) => handleSelectChange('payment_status', value as PaymentStatus)}
                >
                  <SelectTrigger id="payment_status">
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
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
                Book Rental
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface RentalCardProps {
  rental: Rental;
  onUpdatePayment: (rentalId: string, paymentStatus: PaymentStatus) => void;
}

const RentalCard = ({ rental, onUpdatePayment }: RentalCardProps) => {
  const startDate = new Date(rental.start_date);
  const endDate = new Date(rental.end_date);
  const currentDate = new Date();
  
  let statusBadge = "";
  if (currentDate < startDate) {
    statusBadge = "bg-blue-100 text-blue-700";
  } else if (currentDate >= startDate && currentDate <= endDate) {
    statusBadge = "bg-green-100 text-green-700";
  } else {
    statusBadge = "bg-gray-100 text-gray-700";
  }
  
  let paymentBadge = "";
  if (rental.payment_status === 'paid') {
    paymentBadge = "bg-emerald-100 text-emerald-700";
  } else if (rental.payment_status === 'pending') {
    paymentBadge = "bg-amber-100 text-amber-700";
  } else {
    paymentBadge = "bg-red-100 text-red-700";
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle>{rental.renter_name}</CardTitle>
          <div className="flex gap-2">
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusBadge}`}>
              {currentDate < startDate ? "Upcoming" : 
               currentDate >= startDate && currentDate <= endDate ? "Active" : "Completed"}
            </span>
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${paymentBadge}`}>
              {rental.payment_status.charAt(0).toUpperCase() + rental.payment_status.slice(1)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center text-muted-foreground">
              <Phone className="h-4 w-4 mr-1" />
              <span>{rental.renter_phone}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{rental.destination}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              <div>
                <div className="text-sm font-medium">Rental Period</div>
                <div className="text-sm text-muted-foreground">
                  {startDate.toLocaleDateString()} {startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  {' - '}
                  {endDate.toLocaleDateString()} {endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-primary" />
              <div>
                <div className="text-sm font-medium">Payment Status</div>
                <div className="text-sm text-muted-foreground">
                  {rental.payment_status.charAt(0).toUpperCase() + rental.payment_status.slice(1)}
                  {rental.payment_status === 'pending' && (
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="h-auto p-0 ml-2"
                      onClick={() => onUpdatePayment(rental.id, 'paid')}
                    >
                      Update Payment
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Car className="h-5 w-5 mr-2 text-primary" />
              <div>
                <div className="text-sm font-medium">Vehicle</div>
                <div className="text-sm text-muted-foreground">
                  {rental.vehicle ? `${rental.vehicle.name} (${rental.vehicle.license_plate})` : `ID: ${rental.vehicle_id}`}
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2 text-primary" />
              <div>
                <div className="text-sm font-medium">Driver</div>
                <div className="text-sm text-muted-foreground">
                  {rental.driver ? rental.driver.full_name : `ID: ${rental.driver_id}`}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" size="sm" asChild>
              <a href={`/tracking?vehicle=${rental.vehicle_id}`}>
                <Clock className="h-4 w-4 mr-1" /> Track
              </a>
            </Button>
            <Button variant="outline" size="sm">
              Edit Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RentalsPage;
