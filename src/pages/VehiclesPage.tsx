import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { Vehicle, VehicleStatus, VehicleType } from '@/types';
import { Car } from 'lucide-react';

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: 'bus' as VehicleType,
    license_plate: '',
    seats: 0,
    photo_url: '',
    status: 'available' as VehicleStatus
  });

  useEffect(() => {
    // Fetch vehicles from Supabase
    const fetchVehicles = async () => {
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*');
          
        if (error) throw error;
        
        if (data) {
          setVehicles(data);
          setFilteredVehicles(data);
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        toast({
          description: "Failed to fetch vehicles"
        });
      }
    };
    
    fetchVehicles();
  }, []);

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

  const handleAddVehicle = () => {
    setCurrentVehicle(null);
    setFormData({
      id: '',
      name: '',
      type: 'bus',
      license_plate: '',
      seats: 0,
      photo_url: '',
      status: 'available'
    });
    setOpenDialog(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setCurrentVehicle(vehicle);
    setFormData({
      id: vehicle.id,
      name: vehicle.name,
      type: vehicle.type,
      license_plate: vehicle.license_plate,
      seats: vehicle.seats,
      photo_url: vehicle.photo_url || '',
      status: vehicle.status
    });
    setOpenDialog(true);
  };

  const handleDeleteVehicle = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
      toast({
        description: "Vehicle deleted"
      });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        description: "Failed to delete vehicle. It may be referenced in rentals.",
        variant: "destructive"
      });
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'seats' ? parseInt(value) || 0 : value
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
      if (currentVehicle) {
        // Edit existing vehicle
        const { error } = await supabase
          .from('vehicles')
          .update({
            name: formData.name,
            type: formData.type,
            license_plate: formData.license_plate,
            seats: formData.seats,
            photo_url: formData.photo_url,
            status: formData.status
          })
          .eq('id', currentVehicle.id);
          
        if (error) throw error;
        
        setVehicles(vehicles.map(vehicle => 
          vehicle.id === currentVehicle.id ? { ...vehicle, ...formData } : vehicle
        ));
        
        toast({
          description: "Vehicle updated"
        });
      } else {
        // Add new vehicle
        const { data, error } = await supabase
          .from('vehicles')
          .insert([{
            name: formData.name,
            type: formData.type,
            license_plate: formData.license_plate,
            seats: formData.seats,
            photo_url: formData.photo_url,
            status: formData.status
          }])
          .select();
          
        if (error) throw error;
        
        if (data) {
          setVehicles([...vehicles, data[0]]);
          
          toast({
            description: "Vehicle added"
          });
        }
      }
      
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast({
        description: "Failed to save vehicle",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Vehicles</h1>
          <p className="text-muted-foreground">Manage your fleet of vehicles</p>
        </div>
        <Button onClick={handleAddVehicle}>
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Select 
            value={filterType} 
            onValueChange={(value) => setFilterType(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="bus">Bus</SelectItem>
              <SelectItem value="elf">Elf</SelectItem>
              <SelectItem value="hi-ace">Hi-Ace</SelectItem>
              <SelectItem value="car">Car</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Select 
            value={filterStatus} 
            onValueChange={(value) => setFilterStatus(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="rented">Rented</SelectItem>
              <SelectItem value="service">In Service</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.map((vehicle) => (
          <Card key={vehicle.id} className="overflow-hidden">
            <div className="h-48 overflow-hidden relative">
              <img 
                src={vehicle.photo_url || 'https://via.placeholder.com/300'} 
                alt={vehicle.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-white/80 hover:bg-white"
                  onClick={() => handleEditVehicle(vehicle)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-white/80 hover:bg-white text-red-500 hover:text-red-600"
                  onClick={() => handleDeleteVehicle(vehicle.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Badge 
                className={`absolute bottom-2 left-2 ${
                  vehicle.status === 'available' ? 'bg-emerald-500' :
                  vehicle.status === 'rented' ? 'bg-amber-500' : 'bg-slate-500'
                }`}
              >
                {vehicle.status.toUpperCase()}
              </Badge>
            </div>
            <CardContent className="p-4">
              <div className="grid gap-2">
                <h3 className="font-semibold text-lg">{vehicle.name}</h3>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Car className="h-4 w-4 mr-1" />
                    <span className="capitalize">{vehicle.type}</span>
                  </div>
                  <div className="flex items-center">
                    <Settings className="h-4 w-4 mr-1" />
                    <span>{vehicle.seats} seats</span>
                  </div>
                </div>
                <div className="flex items-center text-sm font-medium mt-1">
                  <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span>{vehicle.license_plate}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Vehicle Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{currentVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Vehicle Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Vehicle Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => handleSelectChange('type', value)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
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
                  <Label htmlFor="seats">Number of Seats</Label>
                  <Input
                    id="seats"
                    name="seats"
                    type="number"
                    value={formData.seats}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="license_plate">License Plate</Label>
                <Input
                  id="license_plate"
                  name="license_plate"
                  value={formData.license_plate}
                  onChange={handleFormChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="photo_url">Photo URL</Label>
                <Input
                  id="photo_url"
                  name="photo_url"
                  value={formData.photo_url}
                  onChange={handleFormChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="rented">Rented</SelectItem>
                    <SelectItem value="service">In Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {currentVehicle ? 'Update Vehicle' : 'Add Vehicle'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VehiclesPage;
