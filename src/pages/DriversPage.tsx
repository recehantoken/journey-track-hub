
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Driver, DriverStatus } from '@/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, User, UserPlus } from 'lucide-react';
import { showToast, showErrorToast, showSuccessToast } from '@/utils/toasts';

const DriversPage = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newDriver, setNewDriver] = useState({ full_name: '', phone_number: '' });

  // Fetch drivers from Supabase
  useEffect(() => {
    const fetchDrivers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('drivers')
          .select('*')
          .order('full_name');

        if (error) throw error;
        
        if (data) {
          console.log('Drivers loaded:', data);
          setDrivers(data as Driver[]);
        }
      } catch (error) {
        console.error('Error fetching drivers:', error);
        showErrorToast("Failed to fetch drivers");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  // Create a new driver
  const handleCreateDriver = async () => {
    // Basic validation
    if (!newDriver.full_name || !newDriver.phone_number) {
      showToast("Please fill in all required fields");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('drivers')
        .insert({
          full_name: newDriver.full_name,
          phone_number: newDriver.phone_number,
          status: 'active' as DriverStatus
        })
        .select();

      if (error) throw error;

      // Add the new driver to our state
      if (data && data[0]) {
        const updatedDrivers = [...drivers];
        updatedDrivers.unshift(data[0] as Driver);
        setDrivers(updatedDrivers);
      }
      
      setNewDriver({ full_name: '', phone_number: '' });
      setIsCreateDialogOpen(false);
      showSuccessToast("Driver created successfully");
    } catch (error) {
      console.error('Error creating driver:', error);
      showErrorToast("Failed to create driver");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Drivers</h1>
          <p className="text-muted-foreground">Manage your driver pool</p>
        </div>
        <div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Driver
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="bg-background rounded-md shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.length > 0 ? (
                drivers.map(driver => (
                  <TableRow key={driver.id}>
                    <TableCell className="font-medium">{driver.full_name}</TableCell>
                    <TableCell>{driver.phone_number}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        driver.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : driver.status === 'on-duty' 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {driver.status.replace('_', ' ').charAt(0).toUpperCase() + driver.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">View</Button>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No drivers found. Add your first driver to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add New Driver</AlertDialogTitle>
            <AlertDialogDescription>
              Create a new driver profile. Fill in the details below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="John Doe"
                  className="pl-10"
                  value={newDriver.full_name}
                  onChange={(e) => setNewDriver(prev => ({ ...prev, full_name: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  placeholder="+1234567890"
                  className="pl-10"
                  value={newDriver.phone_number}
                  onChange={(e) => setNewDriver(prev => ({ ...prev, phone_number: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateDriver}>Create Driver</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DriversPage;
