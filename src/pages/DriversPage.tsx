
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent
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
import { Badge } from '@/components/ui/badge';
import { Driver, DriverStatus } from '@/types';
import { Plus, Edit, Trash2, PhoneCall, User } from 'lucide-react';
import { useToast } from '@/components/ui/sonner';

const DriversPage = () => {
  const { toast } = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentDriver, setCurrentDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    fullName: '',
    phoneNumber: '',
    photoUrl: '',
    status: 'active' as DriverStatus
  });

  useEffect(() => {
    // Mock data - would be replaced with API call
    const mockDrivers: Driver[] = [
      {
        id: '1',
        fullName: 'John Doe',
        phoneNumber: '+62 123-456-7890',
        photoUrl: 'https://images.unsplash.com/photo-1493962853295-0fd70327578a',
        status: 'active'
      },
      {
        id: '2',
        fullName: 'Jane Smith',
        phoneNumber: '+62 123-456-7891',
        photoUrl: 'https://images.unsplash.com/photo-1452378174528-3090a4bba7b2',
        status: 'on-duty'
      },
      {
        id: '3',
        fullName: 'Bob Johnson',
        phoneNumber: '+62 123-456-7892',
        photoUrl: 'https://images.unsplash.com/photo-1487252665478-49b61b47f302',
        status: 'active'
      },
      {
        id: '4',
        fullName: 'Alice Williams',
        phoneNumber: '+62 123-456-7893',
        photoUrl: 'https://images.unsplash.com/photo-1466721591366-2d5fba72006d',
        status: 'off'
      }
    ];
    
    setDrivers(mockDrivers);
    setFilteredDrivers(mockDrivers);
  }, []);

  useEffect(() => {
    let result = [...drivers];
    
    if (filterStatus !== 'all') {
      result = result.filter(driver => driver.status === filterStatus);
    }
    
    setFilteredDrivers(result);
  }, [filterStatus, drivers]);

  const handleAddDriver = () => {
    setCurrentDriver(null);
    setFormData({
      id: '',
      fullName: '',
      phoneNumber: '',
      photoUrl: '',
      status: 'active'
    });
    setOpenDialog(true);
  };

  const handleEditDriver = (driver: Driver) => {
    setCurrentDriver(driver);
    setFormData({
      id: driver.id,
      fullName: driver.fullName,
      phoneNumber: driver.phoneNumber,
      photoUrl: driver.photoUrl,
      status: driver.status
    });
    setOpenDialog(true);
  };

  const handleDeleteDriver = (id: string) => {
    setDrivers(drivers.filter(driver => driver.id !== id));
    toast("Driver deleted", {
      description: "Driver has been removed from the system",
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      status: value as DriverStatus
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentDriver) {
      // Edit existing driver
      setDrivers(drivers.map(driver => 
        driver.id === currentDriver.id ? { ...formData, id: currentDriver.id } : driver
      ));
      toast("Driver updated", {
        description: "Driver details have been updated successfully",
      });
    } else {
      // Add new driver
      const newDriver = {
        ...formData,
        id: Date.now().toString()
      };
      setDrivers([...drivers, newDriver]);
      toast("Driver added", {
        description: "New driver has been added to the system",
      });
    }
    
    setOpenDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Drivers</h1>
          <p className="text-muted-foreground">Manage your driver personnel</p>
        </div>
        <Button onClick={handleAddDriver}>
          <Plus className="h-4 w-4 mr-2" />
          Add Driver
        </Button>
      </div>
      
      <div className="flex gap-4">
        <div className="w-full sm:w-64">
          <Select 
            value={filterStatus} 
            onValueChange={setFilterStatus}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on-duty">On Duty</SelectItem>
              <SelectItem value="off">Off</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrivers.map((driver) => (
          <Card key={driver.id}>
            <div className="h-48 overflow-hidden relative">
              <img 
                src={driver.photoUrl} 
                alt={driver.fullName}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-white/80 hover:bg-white"
                  onClick={() => handleEditDriver(driver)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-white/80 hover:bg-white text-red-500 hover:text-red-600"
                  onClick={() => handleDeleteDriver(driver.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Badge 
                className={`absolute bottom-2 left-2 ${
                  driver.status === 'active' ? 'bg-emerald-500' :
                  driver.status === 'on-duty' ? 'bg-amber-500' : 'bg-slate-500'
                }`}
              >
                {driver.status === 'on-duty' ? 'ON DUTY' : driver.status.toUpperCase()}
              </Badge>
            </div>
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{driver.fullName}</h3>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <User className="h-4 w-4 mr-1" />
                    <span>Driver</span>
                  </div>
                  <div className="flex items-center">
                    <PhoneCall className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{driver.phoneNumber}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Driver Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{currentDriver ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleFormChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
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
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on-duty">On Duty</SelectItem>
                    <SelectItem value="off">Off</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {currentDriver ? 'Update Driver' : 'Add Driver'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriversPage;
