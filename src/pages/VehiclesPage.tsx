import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Vehicle, VehicleType, VehicleStatus } from '@/types';
import { Plus, Edit, Trash2, Car, Settings, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';

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
    licensePlate: '',
    seats: 0,
    photoUrl: '',
    status: 'available' as VehicleStatus
  });

  useEffect(() => {
    // Mock data - would be replaced with API call
    const mockVehicles: Vehicle[] = [
      {
        id: '1',
        name: 'Big Traveler',
        type: 'bus',
        licensePlate: 'B 1234 ABC',
        seats: 45,
        photoUrl: 'https://images.unsplash.com/photo-1469041797191-50ace28483c3',
        status: 'available'
      },
      {
        id: '2',
        name: 'Mini Bus',
        type: 'elf',
        licensePlate: 'B 5678 DEF',
        seats: 20,
        photoUrl: 'https://images.unsplash.com/photo-1493962853295-0fd70327578a',
        status: 'rented'
      },
      {
        id: '3',
        name: 'City Shuttle',
        type: 'hi-ace',
        licensePlate: 'B 9012 GHI',
        seats: 16,
        photoUrl: 'https://images.unsplash.com/photo-1493962853295-0fd70327578a',
        status: 'available'
      },
      {
        id: '4',
        name: 'Executive Car',
        type: 'car',
        licensePlate: 'B 3456 JKL',
        seats: 5,
        photoUrl: 'https://images.unsplash.com/photo-1452378174528-3090a4bba7b2',
        status: 'service'
      }
    ];
    
    setVehicles(mockVehicles);
    setFilteredVehicles(mockVehicles);
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
      licensePlate: '',
      seats: 0,
      photoUrl: '',
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
      licensePlate: vehicle.licensePlate,
      seats: vehicle.seats,
      photoUrl: vehicle.photoUrl,
      status: vehicle.status
    });
    setOpenDialog(true);
  };

  const handleDeleteVehicle = (id: string) => {
    setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
    toast("Vehicle deleted", {
      description: "Vehicle has been removed from the system",
    });
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentVehicle) {
      // Edit existing vehicle
      setVehicles(vehicles.map(vehicle => 
        vehicle.id === currentVehicle.id ? { ...formData, id: currentVehicle.id } : vehicle
      ));
      toast("Vehicle updated", {
        description: "Vehicle details have been updated successfully",
      });
    } else {
      // Add new vehicle
      const newVehicle = {
        ...formData,
        id: Date.now().toString()
      };
      setVehicles([...vehicles, newVehicle]);
      toast("Vehicle added", {
        description: "New vehicle has been added to the system",
      });
    }
    
    setOpenDialog(false);
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
                src={vehicle.photoUrl} 
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
                  <span>{vehicle.licensePlate}</span>
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
                <Label htmlFor="licensePlate">License Plate</Label>
                <Input
                  id="licensePlate"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleFormChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="photoUrl">Photo URL</Label>
                <Input
                  id="photoUrl"
                  name="photoUrl"
                  value={formData.photoUrl}
                  onChange={handleFormChange}
                  required
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
