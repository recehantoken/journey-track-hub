
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
import { toast } from '@/components/ui/sonner';
import { supabase } from "@/integrations/supabase/client";

const DriversPage = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentDriver, setCurrentDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    full_name: '',
    phone_number: '',
    photo_url: '',
    status: 'active' as DriverStatus
  });

  useEffect(() => {
    // Fetch drivers from Supabase
    const fetchDrivers = async () => {
      try {
        const { data, error } = await supabase
          .from('drivers')
          .select('*');
          
        if (error) throw error;
        
        if (data) {
          setDrivers(data);
          setFilteredDrivers(data);
        }
      } catch (error) {
        console.error('Error fetching drivers:', error);
        toast({
          title: "Error",
          description: "Failed to fetch drivers",
          variant: "destructive"
        });
      }
    };
    
    fetchDrivers();
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
      full_name: '',
      phone_number: '',
      photo_url: '',
      status: 'active'
    });
    setOpenDialog(true);
  };

  const handleEditDriver = (driver: Driver) => {
    setCurrentDriver(driver);
    setFormData({
      id: driver.id,
      full_name: driver.full_name,
      phone_number: driver.phone_number,
      photo_url: driver.photo_url || '',
      status: driver.status
    });
    setOpenDialog(true);
  };

  const handleDeleteDriver = async (id: string) => {
    try {
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setDrivers(drivers.filter(driver => driver.id !== id));
      toast({
        title: "Driver deleted",
        description: "Driver has been removed from the system",
      });
    } catch (error) {
      console.error('Error deleting driver:', error);
      toast({
        title: "Error",
        description: "Failed to delete driver",
        variant: "destructive"
      });
    }
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (currentDriver) {
        // Edit existing driver
        const { error } = await supabase
          .from('drivers')
          .update({
            full_name: formData.full_name,
            phone_number: formData.phone_number,
            photo_url: formData.photo_url,
            status: formData.status
          })
          .eq('id', currentDriver.id);
          
        if (error) throw error;
        
        setDrivers(drivers.map(driver => 
          driver.id === currentDriver.id ? { ...driver, ...formData } : driver
        ));
        
        toast({
          title: "Driver updated",
          description: "Driver details have been updated successfully",
        });
      } else {
        // Add new driver
        const { data, error } = await supabase
          .from('drivers')
          .insert([{
            full_name: formData.full_name,
            phone_number: formData.phone_number,
            photo_url: formData.photo_url,
            status: formData.status
          }])
          .select();
          
        if (error) throw error;
        
        if (data) {
          setDrivers([...drivers, data[0]]);
          
          toast({
            title: "Driver added",
            description: "New driver has been added to the system",
          });
        }
      }
      
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving driver:', error);
      toast({
        title: "Error",
        description: "Failed to save driver",
        variant: "destructive"
      });
    }
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
                src={driver.photo_url || 'https://via.placeholder.com/300'} 
                alt={driver.full_name}
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
                <h3 className="font-semibold text-lg">{driver.full_name}</h3>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <User className="h-4 w-4 mr-1" />
                    <span>Driver</span>
                  </div>
                  <div className="flex items-center">
                    <PhoneCall className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{driver.phone_number}</span>
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
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleFormChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
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
