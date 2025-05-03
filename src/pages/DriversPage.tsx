import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/sonner';
import { Driver, DriverStatus } from '@/types';
import { Phone, User, Calendar } from 'lucide-react';

const DriversPage = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState<Omit<Driver, 'created_at' | 'updated_at'>>({
    id: '',
    full_name: '',
    phone_number: '',
    photo_url: null,
    status: 'active'
  });

  // Fetch drivers from Supabase
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('drivers')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          setDrivers(data);
        }
      } catch (error) {
        console.error('Error fetching drivers:', error);
        toast({
          description: "Failed to fetch drivers",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDrivers();
  }, []);

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle select change
  const handleSelectChange = (name: string, value: DriverStatus) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission (create/update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editMode && selectedDriver) {
        // Update driver
        const { error } = await supabase
          .from('drivers')
          .update(formData)
          .eq('id', selectedDriver.id);
        
        if (error) throw error;
        
        // Update state
        setDrivers(prev => 
          prev.map(driver => 
            driver.id === selectedDriver.id ? { ...driver, ...formData } : driver
          )
        );
        
        toast({
          description: "Driver updated successfully"
        });
      } else {
        // Create driver
        const { data, error } = await supabase
          .from('drivers')
          .insert([formData])
          .select();
        
        if (error) throw error;
        
        if (data) {
          // Update state
          setDrivers(prev => [...prev, data[0]]);
        }
        
        toast({
          description: "Driver created successfully"
        });
      }
      
      setOpen(false);
    } catch (error) {
      console.error('Error saving driver:', error);
      toast({
        description: "Failed to save driver",
        variant: "destructive"
      });
    }
  };

  // Handle edit driver
  const handleEditDriver = (driver: Driver) => {
    setEditMode(true);
    setSelectedDriver(driver);
    setFormData({
      id: driver.id,
      full_name: driver.full_name,
      phone_number: driver.phone_number,
      photo_url: driver.photo_url,
      status: driver.status
    });
    setOpen(true);
  };

  // Handle create driver
  const handleCreateDriver = () => {
    setEditMode(false);
    setSelectedDriver(null);
    setFormData({
      id: '',
      full_name: '',
      phone_number: '',
      photo_url: null,
      status: 'active'
    });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Drivers</h1>
          <p className="text-muted-foreground">Manage your company drivers</p>
        </div>
        <Button onClick={handleCreateDriver}>Add Driver</Button>
      </div>
      
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="on-duty">On Duty</TabsTrigger>
          <TabsTrigger value="off">Off Duty</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <p>Loading drivers...</p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {drivers.map(driver => (
                <Card key={driver.id} className="bg-card text-card-foreground shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold leading-none tracking-tight">
                      {driver.full_name}
                    </CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {driver.phone_number}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        {driver.photo_url ? (
                          <AvatarImage src={driver.photo_url} alt={driver.full_name} />
                        ) : (
                          <AvatarFallback>{driver.full_name.charAt(0)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">Status: {driver.status}</p>
                        <p className="text-sm text-muted-foreground">
                          <Calendar className="inline-block h-4 w-4 mr-1" />
                          Joined on {new Date(driver.created_at || '').toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="secondary" 
                      className="mt-4 w-full"
                      onClick={() => handleEditDriver(driver)}
                    >
                      Edit Driver
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="active">
          {isLoading ? (
            <p>Loading drivers...</p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {drivers.filter(driver => driver.status === 'active').map(driver => (
                <Card key={driver.id} className="bg-card text-card-foreground shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold leading-none tracking-tight">
                      {driver.full_name}
                    </CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {driver.phone_number}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        {driver.photo_url ? (
                          <AvatarImage src={driver.photo_url} alt={driver.full_name} />
                        ) : (
                          <AvatarFallback>{driver.full_name.charAt(0)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">Status: {driver.status}</p>
                        <p className="text-sm text-muted-foreground">
                          <Calendar className="inline-block h-4 w-4 mr-1" />
                          Joined on {new Date(driver.created_at || '').toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="secondary" 
                      className="mt-4 w-full"
                      onClick={() => handleEditDriver(driver)}
                    >
                      Edit Driver
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="on-duty">
          {isLoading ? (
            <p>Loading drivers...</p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {drivers.filter(driver => driver.status === 'on-duty').map(driver => (
                <Card key={driver.id} className="bg-card text-card-foreground shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold leading-none tracking-tight">
                      {driver.full_name}
                    </CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {driver.phone_number}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        {driver.photo_url ? (
                          <AvatarImage src={driver.photo_url} alt={driver.full_name} />
                        ) : (
                          <AvatarFallback>{driver.full_name.charAt(0)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">Status: {driver.status}</p>
                        <p className="text-sm text-muted-foreground">
                          <Calendar className="inline-block h-4 w-4 mr-1" />
                          Joined on {new Date(driver.created_at || '').toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="secondary" 
                      className="mt-4 w-full"
                      onClick={() => handleEditDriver(driver)}
                    >
                      Edit Driver
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="off">
          {isLoading ? (
            <p>Loading drivers...</p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {drivers.filter(driver => driver.status === 'off').map(driver => (
                <Card key={driver.id} className="bg-card text-card-foreground shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold leading-none tracking-tight">
                      {driver.full_name}
                    </CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {driver.phone_number}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        {driver.photo_url ? (
                          <AvatarImage src={driver.photo_url} alt={driver.full_name} />
                        ) : (
                          <AvatarFallback>{driver.full_name.charAt(0)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">Status: {driver.status}</p>
                        <p className="text-sm text-muted-foreground">
                          <Calendar className="inline-block h-4 w-4 mr-1" />
                          Joined on {new Date(driver.created_at || '').toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="secondary" 
                      className="mt-4 w-full"
                      onClick={() => handleEditDriver(driver)}
                    >
                      Edit Driver
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Driver Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editMode ? 'Edit Driver' : 'Create Driver'}</DialogTitle>
            <DialogDescription>
              {editMode ? 'Update driver details here.' : 'Add a new driver to your company.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="full_name" className="text-right">
                <User className="inline-block h-4 w-4 mr-1" />
                Full Name
              </Label>
              <Input 
                id="full_name" 
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="col-span-3" 
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone_number" className="text-right">
                <Phone className="inline-block h-4 w-4 mr-1" />
                Phone Number
              </Label>
              <Input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="photo_url" className="text-right">
                Photo URL
              </Label>
              <Input
                type="url"
                id="photo_url"
                name="photo_url"
                value={formData.photo_url || ''}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Optional"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value as DriverStatus)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on-duty">On Duty</SelectItem>
                  <SelectItem value="off">Off Duty</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit">{editMode ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriversPage;
