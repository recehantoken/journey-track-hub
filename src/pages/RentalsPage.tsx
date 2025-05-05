import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Rental, Vehicle, Driver } from '@/types';
import { Calendar, MapPin, User, Car, Plus } from 'lucide-react';
import { showToast, showErrorToast, showSuccessToast } from '@/utils/toasts';
import { useSearchParams } from 'react-router-dom';

const RentalsPage = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    id: '',
    renter_name: '',
    renter_phone: '',
    destination: '',
    vehicle_id: '',
    driver_id: '',
    start_date: '',
    end_date: '',
    payment_status: 'pending' as 'pending' | 'paid' | 'cancelled',
  });

  const [newRentalData, setNewRentalData] = useState({
    renter_name: '',
    renter_phone: '',
    destination: '',
    vehicle_id: '',
    driver_id: '',
    start_date: '',
    end_date: '',
    payment_status: 'pending' as 'pending' | 'paid' | 'cancelled',
  });

  // Check for create query parameter on mount
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setIsCreateDialogOpen(true);
      // Clear the query parameter
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

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
          .order('created_at', { ascending: false });

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

        // Update state
        if (rentalsData) setRentals(rentalsData as Rental[]);
        if (vehiclesData) setVehicles(vehiclesData as Vehicle[]);
        if (driversData) setDrivers(driversData as Driver[]);
      } catch (error) {
        console.error('Error fetching rentals:', error);
        showErrorToast("Failed to fetch rentals");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewRentalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewRentalData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewRentalSelectChange = (name: string, value: string) => {
    setNewRentalData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Update rental in database
      const { error } = await supabase
        .from('rentals')
        .update(formData)
        .eq('id', selectedRental?.id);

      if (error) throw error;

      // Update state
      setRentals((prev) =>
        prev.map((rental) =>
          rental.id === selectedRental?.id ? { ...rental, ...formData } : rental
        )
      );

      setOpen(false);
      showSuccessToast("Rental updated successfully");
    } catch (error) {
      console.error('Error updating rental:', error);
      showErrorToast("Failed to update rental");
    }
  };

  const handleCreateRental = async () => {
    if (
      !newRentalData.renter_name ||
      !newRentalData.renter_phone ||
      !newRentalData.destination ||
      !newRentalData.vehicle_id ||
      !newRentalData.start_date ||
      !newRentalData.end_date
    ) {
      showErrorToast("Please fill in all required fields");
      return;
    }

    // Validate date range
    if (new Date(newRentalData.end_date) <= new Date(newRentalData.start_date)) {
      showErrorToast("End date must be after start date");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('rentals')
        .insert({
          renter_name: newRentalData.renter_name,
          renter_phone: newRentalData.renter_phone,
          destination: newRentalData.destination,
          vehicle_id: newRentalData.vehicle_id,
          driver_id: newRentalData.driver_id || null,
          start_date: newRentalData.start_date,
          end_date: newRentalData.end_date,
          payment_status: newRentalData.payment_status,
        })
        .select(`
          *,
          vehicle:vehicles(*),
          driver:drivers(*)
        `);

      if (error) throw error;

      if (data && data[0]) {
        setRentals((prev) => [data[0] as Rental, ...prev]);
        setNewRentalData({
          renter_name: '',
          renter_phone: '',
          destination: '',
          vehicle_id: '',
          driver_id: '',
          start_date: '',
          end_date: '',
          payment_status: 'pending',
        });
        setIsCreateDialogOpen(false);
        showSuccessToast("Rental created successfully");
      }
    } catch (error) {
      console.error('Error creating rental:', error);
      showErrorToast("Failed to create rental");
    }
  };

  const handleOpenDialog = (rental: Rental) => {
    setSelectedRental(rental);
    setFormData({
      id: rental.id,
      renter_name: rental.renter_name,
      renter_phone: rental.renter_phone,
      destination: rental.destination,
      vehicle_id: rental.vehicle_id,
      driver_id: rental.driver_id,
      start_date: rental.start_date,
      end_date: rental.end_date,
      payment_status: rental.payment_status,
    });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Rentals</h1>
          <p className="text-muted-foreground">Manage your vehicle rentals</p>
        </div>
        <div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Rental
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <p>Loading rentals...</p>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {rentals.map((rental) => (
                <Card key={rental.id} className="bg-card text-card-foreground shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold leading-none tracking-tight">
                      {rental.renter_name}
                    </CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(rental.start_date), 'MMM d, yyyy')} -{' '}
                        {format(new Date(rental.end_date), 'MMM d, yyyy')}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{rental.destination}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{rental.driver?.full_name || 'No driver assigned'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      <span>{rental.vehicle?.name}</span>
                    </div>
                    <div>
                      <Label>Payment Status</Label>
                      <Badge
                        variant={
                          rental.payment_status === 'paid'
                            ? 'default'
                            : rental.payment_status === 'cancelled'
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {rental.payment_status}
                      </Badge>
                    </div>
                    <Button onClick={() => handleOpenDialog(rental)}>View Details</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="pending">
          {isLoading ? (
            <p>Loading rentals...</p>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {rentals
                .filter((rental) => rental.payment_status === 'pending')
                .map((rental) => (
                  <Card key={rental.id} className="bg-card text-card-foreground shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold leading-none tracking-tight">
                        {rental.renter_name}
                      </CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(rental.start_date), 'MMM d, yyyy')} -{' '}
                          {format(new Date(rental.end_date), 'MMM d, yyyy')}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{rental.destination}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{rental.driver?.full_name || 'No driver assigned'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        <span>{rental.vehicle?.name}</span>
                      </div>
                      <div>
                        <Label>Payment Status</Label>
                        <Badge
                          variant={
                            rental.payment_status === 'paid'
                              ? 'default'
                              : rental.payment_status === 'cancelled'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {rental.payment_status}
                        </Badge>
                      </div>
                      <Button onClick={() => handleOpenDialog(rental)}>View Details</Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="paid">
          {isLoading ? (
            <p>Loading rentals...</p>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {rentals
                .filter((rental) => rental.payment_status === 'paid')
                .map((rental) => (
                  <Card key={rental.id} className="bg-card text-card-foreground shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold leading-none tracking-tight">
                        {rental.renter_name}
                      </CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(rental.start_date), 'MMM d, yyyy')} -{' '}
                          {format(new Date(rental.end_date), 'MMM d, yyyy')}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{rental.destination}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{rental.driver?.full_name || 'No driver assigned'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        <span>{rental.vehicle?.name}</span>
                      </div>
                      <div>
                        <Label>Payment Status</Label>
                        <Badge
                          variant={
                            rental.payment_status === 'paid'
                              ? 'default'
                              : rental.payment_status === 'cancelled'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {rental.payment_status}
                        </Badge>
                      </div>
                      <Button onClick={() => handleOpenDialog(rental)}>View Details</Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="cancelled">
          {isLoading ? (
            <p>Loading rentals...</p>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {rentals
                .filter((rental) => rental.payment_status === 'cancelled')
                .map((rental) => (
                  <Card key={rental.id} className="bg-card text-card-foreground shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold leading-none tracking-tight">
                        {rental.renter_name}
                      </CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(rental.start_date), 'MMM d, yyyy')} -{' '}
                          {format(new Date(rental.end_date), 'MMM d, yyyy')}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{rental.destination}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{rental.driver?.full_name || 'No driver assigned'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        <span>{rental.vehicle?.name}</span>
                      </div>
                      <div>
                        <Label>Payment Status</Label>
                        <Badge
                          variant={
                            rental.payment_status === 'paid'
                              ? 'default'
                              : rental.payment_status === 'cancelled'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {rental.payment_status}
                        </Badge>
                      </div>
                      <Button onClick={() => handleOpenDialog(rental)}>View Details</Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Update Rental Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Rental Details</DialogTitle>
            <DialogDescription>
              Make changes to your rental here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="renter_name">Renter Name</Label>
                  <Input
                    id="renter_name"
                    name="renter_name"
                    value={formData.renter_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="renter_phone">Renter Phone</Label>
                  <Input
                    id="renter_phone"
                    name="renter_phone"
                    value={formData.renter_phone}
                    onChange={handleInputChange}
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
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.name} - {vehicle.license_plate} ({vehicle.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="driver_id">Driver (Optional)</Label>
                <Select
                  value={formData.driver_id}
                  onValueChange={(value) => handleSelectChange('driver_id', value)}
                >
                  <SelectTrigger id="driver_id">
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No driver</SelectItem>
                    {drivers.map((driver) => (
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
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="payment_status">Payment Status</Label>
                <Select
                  value={formData.payment_status}
                  onValueChange={(value) =>
                    handleSelectChange('payment_status', value as 'pending' | 'paid' | 'cancelled')
                  }
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

            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Rental Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Rental</DialogTitle>
            <DialogDescription>
              Add a new rental booking to the system. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="new_renter_name">Renter Name</Label>
                  <Input
                    id="new_renter_name"
                    name="renter_name"
                    value={newRentalData.renter_name}
                    onChange={handleNewRentalInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new_renter_phone">Renter Phone</Label>
                  <Input
                    id="new_renter_phone"
                    name="renter_phone"
                    value={newRentalData.renter_phone}
                    onChange={handleNewRentalInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="new_vehicle_id">Vehicle</Label>
                <Select
                  value={newRentalData.vehicle_id}
                  onValueChange={(value) => handleNewRentalSelectChange('vehicle_id', value)}
                >
                  <SelectTrigger id="new_vehicle_id">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.name} - {vehicle.license_plate} ({vehicle.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="new_driver_id">Driver (Optional)</Label>
                <Select
                  value={newRentalData.driver_id}
                  onValueChange={(value) => handleNewRentalSelectChange('driver_id', value)}
                >
                  <SelectTrigger id="new_driver_id">
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No driver</SelectItem>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.full_name} - {driver.phone_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="new_destination">Destination</Label>
                <Input
                  id="new_destination"
                  name="destination"
                  value={newRentalData.destination}
                  onChange={handleNewRentalInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="new_start_date">Start Date</Label>
                  <Input
                    id="new_start_date"
                    name="start_date"
                    type="date"
                    value={newRentalData.start_date}
                    onChange={handleNewRentalInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new_end_date">End Date</Label>
                  <Input
                    id="new_end_date"
                    name="end_date"
                    type="date"
                    value={newRentalData.end_date}
                    onChange={handleNewRentalInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="new_payment_status">Payment Status</Label>
                <Select
                  value={newRentalData.payment_status}
                  onValueChange={(value) =>
                    handleNewRentalSelectChange('payment_status', value as 'pending' | 'paid' | 'cancelled')
                  }
                >
                  <SelectTrigger id="new_payment_status">
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

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRental}>Create Rental</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RentalsPage;