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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Vehicle, VehicleType } from '@/types';
import { showErrorToast, showSuccessToast } from '@/utils/toasts';
import { format } from 'date-fns';
import { Edit, Eye, Trash } from 'lucide-react';

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewVehicle, setViewVehicle] = useState<Vehicle | null>(null);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [deleteVehicleId, setDeleteVehicleId] = useState<string | null>(null);

  // Fetch vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from('vehicles').select('*');
        if (error) throw error;
        setVehicles(data as Vehicle[] || []);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        setError('Failed to load vehicles. Please try again.');
        showErrorToast('Failed to load vehicles');
      } finally {
        setIsLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  // Handle View
  const handleView = (vehicle: Vehicle) => {
    setViewVehicle(vehicle);
  };

  // Handle Edit
  const handleEdit = (vehicle: Vehicle) => {
    setEditVehicle(vehicle);
  };

  const handleEditSubmit = async () => {
    if (!editVehicle) return;
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({
          name: editVehicle.name,
          license_plate: editVehicle.license_plate,
          type: editVehicle.type,
        })
        .eq('id', editVehicle.id);
      if (error) throw error;
      setVehicles(vehicles.map((v) => (v.id === editVehicle.id ? editVehicle : v)));
      setEditVehicle(null);
      showSuccessToast('Vehicle updated successfully');
    } catch (error) {
      console.error('Error updating vehicle:', error);
      showErrorToast('Failed to update vehicle');
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!deleteVehicleId) return;
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', deleteVehicleId);
      if (error) throw error;
      setVehicles(vehicles.filter((v) => v.id !== deleteVehicleId));
      setDeleteVehicleId(null);
      showSuccessToast('Vehicle deleted successfully');
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      showErrorToast('Failed to delete vehicle');
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
        <h1 className="text-2xl sm:text-3xl font-bold">Vehicles</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage your vehicles
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Vehicle List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                <p>Loading vehicles...</p>
              </div>
            </div>
          ) : vehicles.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>License Plate</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell>{vehicle.name}</TableCell>
                      <TableCell>{vehicle.license_plate}</TableCell>
                      <TableCell>{vehicle.type}</TableCell>
                      <TableCell>
                        {format(new Date(vehicle.created_at), 'PPP')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(vehicle)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(vehicle)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteVehicleId(vehicle.id)}
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
                No vehicles found.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      {viewVehicle && (
        <Dialog open={!!viewVehicle} onOpenChange={() => setViewVehicle(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Vehicle Details</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Name</Label>
                <span className="col-span-3">{viewVehicle.name}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">License Plate</Label>
                <span className="col-span-3">{viewVehicle.license_plate}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Type</Label>
                <span className="col-span-3">{viewVehicle.type}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Created At</Label>
                <span className="col-span-3">
                  {format(new Date(viewVehicle.created_at), 'PPP')}
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setViewVehicle(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Dialog */}
      {editVehicle && (
        <Dialog open={!!editVehicle} onOpenChange={() => setEditVehicle(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Vehicle</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={editVehicle.name}
                  onChange={(e) =>
                    setEditVehicle({ ...editVehicle, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="license_plate" className="text-right">
                  License Plate
                </Label>
                <Input
                  id="license_plate"
                  value={editVehicle.license_plate}
                  onChange={(e) =>
                    setEditVehicle({
                      ...editVehicle,
                      license_plate: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select
                  value={editVehicle.type}
                  onValueChange={(value: VehicleType) =>
                    setEditVehicle({ ...editVehicle, type: value })
                  }
                >
                  <SelectTrigger id="type" className="col-span-3">
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sedan">Sedan</SelectItem>
                    <SelectItem value="SUV">SUV</SelectItem>
                    <SelectItem value="MPV">MPV</SelectItem>
                    <SelectItem value="Truck">Truck</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditVehicle(null)}>
                Cancel
              </Button>
              <Button onClick={handleEditSubmit}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteVehicleId && (
        <Dialog
          open={!!deleteVehicleId}
          onOpenChange={() => setDeleteVehicleId(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this vehicle? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteVehicleId(null)}
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

export default VehiclesPage;