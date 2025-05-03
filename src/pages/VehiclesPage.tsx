import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Vehicle, VehicleStatus, VehicleType } from '@/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Car, Edit, Trash, Plus } from 'lucide-react';
import { showToast, showErrorToast, showSuccessToast } from '@/utils/toasts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [newVehicle, setNewVehicle] = useState({
    name: '',
    type: 'car' as VehicleType,
    license_plate: '',
    seats: 4,
    status: 'available' as VehicleStatus,
  });
  const [filterType, setFilterType] = useState<VehicleType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<VehicleStatus | 'all'>('all');
  const [error, setError] = useState<string | null>(null);

  // Fetch vehicles from Supabase
  useEffect(() => {
    const fetchVehicles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .order('name');

        if (error) {
          console.error('Supabase error:', error);
          throw new Error(error.message || 'Failed to fetch vehicles');
        }

        console.log('Supabase response:', data);

        if (data) {
          console.log('Vehicles loaded:', data);
          setVehicles(data as Vehicle[]);
          setFilteredVehicles(data as Vehicle[]);
        } else {
          console.log('No data returned from Supabase');
          setVehicles([]);
          setFilteredVehicles([]);
        }
      } catch (err: any) {
        console.error('Error fetching vehicles:', err);
        setError(err.message || 'An unexpected error occurred');
        showErrorToast(err.message || 'Failed to fetch vehicles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  // Filter vehicles
  useEffect(() => {
    let result = [...vehicles];
    if (filterType !== 'all') {
      result = result.filter(vehicle => vehicle.type === filterType);
    }
    if (filterStatus !== 'all') {
      result = result.filter(vehicle => vehicle.status === filterStatus);
    }
    setFilteredVehicles(result);
  }, [filterType, filterStatus, vehicles]);

  // Create a new vehicle
  const handleCreateVehicle = async () => {
    if (!newVehicle.name || !newVehicle.license_plate || newVehicle.seats <= 0) {
      showToast('Please fill in all required fields and ensure seats is a positive number');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert({
          name: newVehicle.name,
          type: newVehicle.type,
          license_plate: newVehicle.license_plate,
          seats: newVehicle.seats,
          status: newVehicle.status,
        })
        .select();

      if (error) {
        console.error('Supabase error on insert:', error);
        throw new Error(error.message || 'Failed to create vehicle');
      }

      console.log('New vehicle created:', data);

      if (data && data[0]) {
        const updatedVehicles = [...vehicles, data[0] as Vehicle];
        setVehicles(updatedVehicles);
        setFilteredVehicles(updatedVehicles);
      }

      setNewVehicle({ name: '', type: 'car', license_plate: '', seats: 4, status: 'available' });
      setIsCreateDialogOpen(false);
      showSuccessToast('Vehicle created successfully');
    } catch (err: any) {
      console.error('Error creating vehicle:', err);
      showErrorToast(err.message || 'Failed to create vehicle');
    }
  };

  // Delete a vehicle
  const handleDeleteVehicle = async () => {
    if (!selectedVehicle) return;

    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', selectedVehicle.id);

      if (error) {
        console.error('Supabase error on delete:', error);
        throw new Error(error.message || 'Failed to delete vehicle');
      }

      const updatedVehicles = vehicles.filter(v => v.id !== selectedVehicle.id);
      setVehicles(updatedVehicles);
      setFilteredVehicles(updatedVehicles);
      setIsDeleteDialogOpen(false);
      setSelectedVehicle(null);
      showSuccessToast('Vehicle deleted successfully');
    } catch (err: any) {
      console.error('Error deleting vehicle:', err);
      showErrorToast(err.message || 'Failed to delete vehicle');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Vehicles</h1>
          <p className="text-muted-foreground">Manage your vehicle fleet</p>
        </div>
        <div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <Select value={filterType} onValueChange={(value) => setFilterType(value as VehicleType | 'all')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="bus">Bus</SelectItem>
            <SelectItem value="elf">Elf</SelectItem>
            <SelectItem value="hi-ace">Hi-Ace</SelectItem>
            <SelectItem value="car">Car</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as VehicleStatus | 'all')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="rented">Rented</SelectItem>
            <SelectItem value="service">Service</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-4">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.length > 0 ? (
            filteredVehicles.map(vehicle => (
              <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>{vehicle.name}</CardTitle>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    vehicle.status === 'available' 
                      ? 'bg-green-100 text-green-800' 
                      : vehicle.status === 'rented' 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                  </span>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    <p><strong>Type:</strong> {vehicle.type}</p>
                    <p><strong>License Plate:</strong> {vehicle.license_plate}</p>
                    <p><strong>Seats:</strong> {vehicle.seats}</p>
                    {vehicle.current_location_lat && vehicle.current_location_lng && (
                      <p><strong>Location:</strong> ({vehicle.current_location_lat}, {vehicle.current_location_lng})</p>
                    )}
                  </CardDescription>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => { setSelectedVehicle(vehicle); setIsDeleteDialogOpen(true); }}>
                      <Trash className="h-4 w-4 mr-2" /> Delete
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              No vehicles found. Add your first vehicle to get started.
            </div>
          )}
        </div>
      )}

      <AlertDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add New Vehicle</AlertDialogTitle>
            <AlertDialogDescription>
              Create a new vehicle for your fleet. Fill in the details below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Toyota Hi-Ace"
                value={newVehicle.name}
                onChange={(e) => setNewVehicle(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select value={newVehicle.type} onValueChange={(value) => setNewVehicle(prev => ({ ...prev, type: value as VehicleType }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bus">Bus</SelectItem>
                  <SelectItem value="elf">Elf</SelectItem>
                  <SelectItem value="hi-ace">Hi-Ace</SelectItem>
                  <SelectItem value="car">Car</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="license-plate">License Plate</Label>
              <Input
                id="license-plate"
                placeholder="ABC123"
                value={newVehicle.license_plate}
                onChange={(e) => setNewVehicle(prev => ({ ...prev, license_plate: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="seats">Seats</Label>
              <Input
                id="seats"
                type="number"
                min="1"
                value={newVehicle.seats}
                onChange={(e) => setNewVehicle(prev => ({ ...prev, seats: parseInt(e.target.value) || 4 }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={newVehicle.status} onValueChange={(value) => setNewVehicle(prev => ({ ...prev, status: value as VehicleStatus }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateVehicle}>Create Vehicle</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the vehicle "{selectedVehicle?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVehicle}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VehiclesPage;