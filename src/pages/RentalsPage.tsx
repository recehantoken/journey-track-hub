
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Rental, Driver, Vehicle, PaymentStatus } from '@/types';
import { 
  Plus, 
  Calendar, 
  MapPin, 
  User, 
  Car, 
  Phone,
  Clock,
  CreditCard
} from 'lucide-react';
import { useToast } from '@/components/ui/sonner';

const RentalsPage = () => {
  const { toast } = useToast();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTab, setCurrentTab] = useState('all');
  
  const [formData, setFormData] = useState({
    id: '',
    renterName: '',
    renterPhone: '',
    vehicleId: '',
    driverId: '',
    startDate: '',
    endDate: '',
    destination: '',
    paymentStatus: 'pending' as PaymentStatus
  });

  useEffect(() => {
    // Mock data - would be replaced with API calls
    const mockRentals: Rental[] = [
      {
        id: '1',
        renterName: 'John Doe',
        renterPhone: '+62 123-456-7890',
        vehicleId: '1',
        driverId: '1',
        startDate: '2025-05-01T08:00:00',
        endDate: '2025-05-03T18:00:00',
        destination: 'Jakarta',
        paymentStatus: 'paid',
        created_at: '2025-04-28T10:30:00'
      },
      {
        id: '2',
        renterName: 'Jane Smith',
        renterPhone: '+62 123-456-7891',
        vehicleId: '2',
        driverId: null,
        startDate: '2025-05-02T09:00:00',
        endDate: '2025-05-02T17:00:00',
        destination: 'Bandung',
        paymentStatus: 'pending',
        created_at: '2025-04-29T14:15:00'
      },
      {
        id: '3',
        renterName: 'Bob Johnson',
        renterPhone: '+62 123-456-7892',
        vehicleId: '3',
        driverId: '2',
        startDate: '2025-05-05T07:30:00',
        endDate: '2025-05-07T19:00:00',
        destination: 'Surabaya',
        paymentStatus: 'paid',
        created_at: '2025-04-30T11:45:00'
      },
      {
        id: '4',
        renterName: 'Alice Williams',
        renterPhone: '+62 123-456-7893',
        vehicleId: '4',
        driverId: '3',
        startDate: '2025-04-28T10:00:00',
        endDate: '2025-04-30T16:00:00',
        destination: 'Yogyakarta',
        paymentStatus: 'failed',
        created_at: '2025-04-27T09:20:00'
      }
    ];
    
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
        id: '3',
        name: 'City Shuttle',
        type: 'hi-ace',
        licensePlate: 'B 9012 GHI',
        seats: 16,
        photoUrl: 'https://images.unsplash.com/photo-1493962853295-0fd70327578a',
        status: 'available'
      }
    ];
    
    const mockDrivers: Driver[] = [
      {
        id: '1',
        fullName: 'John Doe',
        phoneNumber: '+62 123-456-7890',
        photoUrl: 'https://images.unsplash.com/photo-1493962853295-0fd70327578a',
        status: 'active'
      },
      {
        id: '3',
        fullName: 'Bob Johnson',
        phoneNumber: '+62 123-456-7892',
        photoUrl: 'https://images.unsplash.com/photo-1487252665478-49b61b47f302',
        status: 'active'
      }
    ];
    
    setRentals(mockRentals);
    setAvailableVehicles(mockVehicles);
    setAvailableDrivers(mockDrivers);
  }, []);

  const handleAddRental = () => {
    setFormData({
      id: '',
      renterName: '',
      renterPhone: '',
      vehicleId: '',
      driverId: '',
      startDate: '',
      endDate: '',
      destination: '',
      paymentStatus: 'pending'
    });
    setOpenDialog(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    
    const newRental = {
      ...formData,
      id: Date.now().toString(),
      driverId: formData.driverId || null,
      created_at: new Date().toISOString()
    };
    
    setRentals([newRental, ...rentals]);
    setOpenDialog(false);
    toast("Rental created", {
      description: "New rental has been added to the system",
    });
  };

  const filteredRentals = rentals.filter(rental => {
    if (currentTab === 'all') return true;
    
    const currentDate = new Date();
    const startDate = new Date(rental.startDate);
    const endDate = new Date(rental.endDate);
    
    if (currentTab === 'active') {
      return currentDate >= startDate && currentDate <= endDate;
    } else if (currentTab === 'upcoming') {
      return startDate > currentDate;
    } else if (currentTab === 'completed') {
      return endDate < currentDate;
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Rentals</h1>
          <p className="text-muted-foreground">Manage your vehicle rentals</p>
        </div>
        <Button onClick={handleAddRental}>
          <Plus className="h-4 w-4 mr-2" />
          Add Rental
        </Button>
      </div>
      
      <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab}>
        <TabsList>
          <TabsTrigger value="all">All Rentals</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredRentals.map(rental => (
              <RentalCard key={rental.id} rental={rental} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="active" className="mt-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredRentals.map(rental => (
              <RentalCard key={rental.id} rental={rental} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="upcoming" className="mt-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredRentals.map(rental => (
              <RentalCard key={rental.id} rental={rental} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredRentals.map(rental => (
              <RentalCard key={rental.id} rental={rental} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Rental Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Book New Rental</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="renterName">Renter Name</Label>
                  <Input
                    id="renterName"
                    name="renterName"
                    value={formData.renterName}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="renterPhone">Renter Phone</Label>
                  <Input
                    id="renterPhone"
                    name="renterPhone"
                    value={formData.renterPhone}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="vehicleId">Vehicle</Label>
                <Select 
                  value={formData.vehicleId} 
                  onValueChange={(value) => handleSelectChange('vehicleId', value)}
                >
                  <SelectTrigger id="vehicleId">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVehicles.map(vehicle => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.name} - {vehicle.licensePlate} ({vehicle.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="driverId">Driver (Optional)</Label>
                <Select 
                  value={formData.driverId} 
                  onValueChange={(value) => handleSelectChange('driverId', value)}
                >
                  <SelectTrigger id="driverId">
                    <SelectValue placeholder="Select driver (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Driver</SelectItem>
                    {availableDrivers.map(driver => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.fullName} - {driver.phoneNumber}
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
                  onChange={handleFormChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date & Time</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date & Time</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select 
                  value={formData.paymentStatus} 
                  onValueChange={(value) => handleSelectChange('paymentStatus', value)}
                >
                  <SelectTrigger id="paymentStatus">
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Book Rental
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface RentalCardProps {
  rental: Rental;
}

const RentalCard = ({ rental }: RentalCardProps) => {
  const startDate = new Date(rental.startDate);
  const endDate = new Date(rental.endDate);
  const currentDate = new Date();
  
  let statusBadge = "";
  if (currentDate < startDate) {
    statusBadge = "bg-blue-100 text-blue-700";
  } else if (currentDate >= startDate && currentDate <= endDate) {
    statusBadge = "bg-green-100 text-green-700";
  } else {
    statusBadge = "bg-gray-100 text-gray-700";
  }
  
  let paymentBadge = "";
  if (rental.paymentStatus === 'paid') {
    paymentBadge = "bg-emerald-100 text-emerald-700";
  } else if (rental.paymentStatus === 'pending') {
    paymentBadge = "bg-amber-100 text-amber-700";
  } else {
    paymentBadge = "bg-red-100 text-red-700";
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle>{rental.renterName}</CardTitle>
          <div className="flex gap-2">
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusBadge}`}>
              {currentDate < startDate ? "Upcoming" : 
               currentDate >= startDate && currentDate <= endDate ? "Active" : "Completed"}
            </span>
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${paymentBadge}`}>
              {rental.paymentStatus.charAt(0).toUpperCase() + rental.paymentStatus.slice(1)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center text-muted-foreground">
              <Phone className="h-4 w-4 mr-1" />
              <span>{rental.renterPhone}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{rental.destination}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              <div>
                <div className="text-sm font-medium">Rental Period</div>
                <div className="text-sm text-muted-foreground">
                  {startDate.toLocaleDateString()} {startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  {' - '}
                  {endDate.toLocaleDateString()} {endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-primary" />
              <div>
                <div className="text-sm font-medium">Payment Status</div>
                <div className="text-sm text-muted-foreground">
                  {rental.paymentStatus.charAt(0).toUpperCase() + rental.paymentStatus.slice(1)}
                  {rental.paymentStatus === 'pending' && (
                    <Button variant="link" size="sm" className="h-auto p-0 ml-2">
                      Update Payment
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Car className="h-5 w-5 mr-2 text-primary" />
              <div>
                <div className="text-sm font-medium">Vehicle</div>
                <div className="text-sm text-muted-foreground">ID: {rental.vehicleId}</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2 text-primary" />
              <div>
                <div className="text-sm font-medium">Driver</div>
                <div className="text-sm text-muted-foreground">
                  {rental.driverId ? `ID: ${rental.driverId}` : 'No driver assigned'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" size="sm">
              <Clock className="h-4 w-4 mr-1" /> Track
            </Button>
            <Button variant="outline" size="sm">
              Edit Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RentalsPage;
