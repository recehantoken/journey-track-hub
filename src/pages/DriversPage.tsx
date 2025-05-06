import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Driver } from '@/types';
import { showErrorToast, showSuccessToast } from '@/utils/toasts';
import { format } from 'date-fns';
import { Edit, Eye, Trash } from 'lucide-react';

const DriversPage = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewDriver, setViewDriver] = useState<Driver | null>(null);
  const [editDriver, setEditDriver] = useState<Driver | null>(null);
  const [deleteDriverId, setDeleteDriverId] = useState<string | null>(null);

  // Fetch drivers
  useEffect(() => {
    const fetchDrivers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from('drivers').select('*');
        if (error) throw error;
        setDrivers(data as Driver[] || []);
      } catch (error) {
        console.error('Error fetching drivers:', error);
        setError('Failed to load drivers. Please try again.');
        showErrorToast('Failed to load drivers');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDrivers();
  }, []);

  // Handle View
  const handleView = (driver: Driver) => {
    setViewDriver(driver);
  };

  // Handle Edit
  const handleEdit = (driver: Driver) => {
    setEditDriver(driver);
  };

  const handleEditSubmit = async () => {
    if (!editDriver) return;
    try {
      const { error } = await supabase
        .from('drivers')
        .update({
          full_name: editDriver.full_name,
          phone_number: editDriver.phone_number,
          license_number: editDriver.license_number,
        })
        .eq('id', editDriver.id);
      if (error) throw error;
      setDrivers(drivers.map((d) => (d.id === editDriver.id ? editDriver : d)));
      setEditDriver(null);
      showSuccessToast('Driver updated successfully');
    } catch (error) {
      console.error('Error updating driver:', error);
      showErrorToast('Failed to update driver');
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!deleteDriverId) return;
    try {
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', deleteDriverId);
      if (error) throw error;
      setDrivers(drivers.filter((d) => d.id !== deleteDriverId));
      setDeleteDriverId(null);
      showSuccessToast('Driver deleted successfully');
    } catch (error) {
      console.error('Error deleting driver:', error);
      showErrorToast('Failed to delete driver');
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-red-600">Error</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Drivers</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage your drivers
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Driver List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                <p>Loading drivers...</p>
              </div>
            </div>
          ) : drivers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>License Number</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell>{driver.full_name}</TableCell>
                      <TableCell>{driver.phone_number}</TableCell>
                      <TableCell>{driver.license_number}</TableCell>
                      <TableCell>
                        {format(new Date(driver.created_at), 'PPP')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(driver)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(driver)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteDriverId(driver.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-muted-foreground text-sm sm:text-base">
                No drivers found.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      {viewDriver && (
        <Dialog open={!!viewDriver} onOpenChange={() => setViewDriver(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Driver Details</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Full Name</Label>
                <span className="col-span-3">{viewDriver.full_name}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Phone Number</Label>
                <span className="col-span-3">{viewDriver.phone_number}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">License Number</Label>
                <span className="col-span-3">{viewDriver.license_number}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Created At</Label>
                <span className="col-span-3">
                  {format(new Date(viewDriver.created_at), 'PPP')}
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setViewDriver(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Dialog */}
      {editDriver && (
        <Dialog open={!!editDriver} onOpenChange={() => setEditDriver(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Driver</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="full_name" className="text-right">
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  value={editDriver.full_name}
                  onChange={(e) =>
                    setEditDriver({ ...editDriver, full_name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone_number" className="text-right">
                  Phone Number
                </Label>
                <Input
                  id="phone_number"
                  value={editDriver.phone_number}
                  onChange={(e) =>
                    setEditDriver({ ...editDriver, phone_number: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="license_number" className="text-right">
                  License Number
                </Label>
                <Input
                  id="license_number"
                  value={editDriver.license_number}
                  onChange={(e) =>
                    setEditDriver({
                      ...editDriver,
                      license_number: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDriver(null)}>
                Cancel
              </Button>
              <Button onClick={handleEditSubmit}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDriverId && (
        <Dialog
          open={!!deleteDriverId}
          onOpenChange={() => setDeleteDriverId(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this driver? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDriverId(null)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DriversPage;