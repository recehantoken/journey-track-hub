import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Vehicle, Driver } from '@/types';
import { showErrorToast, showSuccessToast } from '@/utils/toasts';
import { useNavigate } from 'react-router-dom';

const NewRentalPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    renter_name: '',
    renter_phone: '',
    destination: '',
    vehicle_id: '',
    driver_id: '',
    start_date: '',
    end_date: '',
    payment_status: 'pending' as 'pending' | 'paid' | 'cancelled',
  });
  const navigate = useNavigate();

  // Fetch vehicles and drivers
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*');
        if (vehiclesError) throw vehiclesError;

        const { data: driversData, error: driversError } = await supabase
          .from('drivers')
          .select('*');
        if (driversError) throw driversError;

        setVehicles(vehiclesData as Vehicle[] || []);
        setDrivers(driversData as Driver[] || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        showErrorToast('Failed to fetch vehicles and drivers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.renter_name ||
      !formData.renter_phone ||
      !formData.destination ||
      !formData.vehicle_id ||
      !formData.start_date ||
      !formData.end_date
    ) {
      showErrorToast('Please fill in all required fields');
      return;
    }

    // Validate date range
    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      showErrorToast('End date must be after start date');
      return;
    }

    try {
      const { error } = await supabase.from('rentals').insert({
        renter_name: formData.renter_name,
        renter_phone: formData.renter_phone,
        destination: formData.destination,
        vehicle_id: formData.vehicle_id,
        driver_id: formData.driver_id || null, // Allow optional driver
        start_date: formData.start_date,
        end_date: formData.end_date,
        payment_status: formData.payment_status,
      });

      if (error) throw error;

      showSuccessToast('Rental created successfully');
      navigate('/rentals'); // Redirect to Rentals page after creation
    } catch (error) {
      console.error('Error creating rental:', error);
      showErrorToast('Failed to create rental');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Create New Rental</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Add a new rental booking to the system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">New Rental Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">Loading...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="renter_name">Renter Name</Label>
                    <Input
                      id="renter_name"
                      name="renter_name"
                      value={formData.renter_name}
                      onChange={handleInputChange}
                      required
                      className="h-10"
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
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="vehicle_id">Vehicle</Label>
                  <Select
                    value={formData.vehicle_id}
                    onValueChange={(value) => handleSelectChange('vehicle_id', value)}
                  >
                    <SelectTrigger id="vehicle_id" className="h-10">
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
                    <SelectTrigger id="driver_id" className="h-10">
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
                    className="h-10"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      name="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      required
                      className="h-10"
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
                      className="h-10"
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
                    <SelectTrigger id="payment_status" className="h-10">
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

              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" className="w-full sm:w-auto">Create Rental</Button>
                <Button variant="outline" onClick={() => navigate('/rentals')} className="w-full sm:w-auto">
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NewRentalPage;