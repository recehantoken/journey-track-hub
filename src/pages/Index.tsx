import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardStats, Rental, Vehicle } from '@/types';
import { Car, Clock, Calendar, User } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/sonner';

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 0,
    availableVehicles: 0,
    rentedVehicles: 0,
    inServiceVehicles: 0,
    totalDrivers: 0,
    activeDrivers: 0,
    onDutyDrivers: 0,
    offDrivers: 0,
    totalRentals: 0,
    activeRentals: 0
  });
  
  const [recentRentals, setRecentRentals] = useState<Rental[]>([]);
  const [popularVehicles, setPopularVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    // This would be replaced with actual API calls
    // Simulating data for demo purposes
    const mockStats: DashboardStats = {
      totalVehicles: 24,
      availableVehicles: 12,
      rentedVehicles: 8,
      inServiceVehicles: 4,
      totalDrivers: 15,
      activeDrivers: 6,
      onDutyDrivers: 8,
      offDrivers: 1,
      totalRentals: 120,
      activeRentals: 8
    };
    
    const mockRentals: Rental[] = [
      {
        id: '1',
        renterName: 'John Doe',
        renterPhone: '+1234567890',
        vehicleId: 'v1',
        driverId: 'd1',
        startDate: '2025-05-01T08:00:00',
        endDate: '2025-05-03T18:00:00',
        destination: 'Jakarta',
        paymentStatus: 'paid',
        created_at: '2025-04-28T10:30:00'
      },
      {
        id: '2',
        renterName: 'Jane Smith',
        renterPhone: '+1234567891',
        vehicleId: 'v2',
        driverId: null,
        startDate: '2025-05-02T09:00:00',
        endDate: '2025-05-02T17:00:00',
        destination: 'Bandung',
        paymentStatus: 'pending',
        created_at: '2025-04-29T14:15:00'
      },
      {
        id: '3',
        renterName: 'Robert Johnson',
        renterPhone: '+1234567892',
        vehicleId: 'v3',
        driverId: 'd2',
        startDate: '2025-05-05T07:30:00',
        endDate: '2025-05-07T19:00:00',
        destination: 'Surabaya',
        paymentStatus: 'paid',
        created_at: '2025-04-30T11:45:00'
      }
    ];
    
    const mockVehicles: Vehicle[] = [
      {
        id: 'v1',
        name: 'Big Traveler',
        type: 'bus',
        licensePlate: 'B 1234 ABC',
        seats: 45,
        photoUrl: 'https://images.unsplash.com/photo-1469041797191-50ace28483c3',
        status: 'rented'
      },
      {
        id: 'v2',
        name: 'City Shuttle',
        type: 'hi-ace',
        licensePlate: 'B 5678 DEF',
        seats: 16,
        photoUrl: 'https://images.unsplash.com/photo-1493962853295-0fd70327578a',
        status: 'available'
      },
      {
        id: 'v3',
        name: 'Executive Car',
        type: 'car',
        licensePlate: 'B 9012 GHI',
        seats: 5,
        photoUrl: 'https://images.unsplash.com/photo-1452378174528-3090a4bba7b2',
        status: 'available'
      }
    ];

    setStats(mockStats);
    setRecentRentals(mockRentals);
    setPopularVehicles(mockVehicles);
    
    toast("Welcome to JourneyTrack", {
      description: "Vehicle rental management system is ready!",
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your vehicle rental business</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">{stats.totalVehicles}</div>
              <Car className="h-6 w-6 text-primary" />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="text-xs">
                <div className="font-semibold text-emerald-500">{stats.availableVehicles}</div>
                <div className="text-muted-foreground">Available</div>
              </div>
              <div className="text-xs">
                <div className="font-semibold text-orange-400">{stats.rentedVehicles}</div>
                <div className="text-muted-foreground">Rented</div>
              </div>
              <div className="text-xs">
                <div className="font-semibold text-slate-500">{stats.inServiceVehicles}</div>
                <div className="text-muted-foreground">Service</div>
              </div>
            </div>
            <Progress 
              value={stats.availableVehicles / stats.totalVehicles * 100} 
              className="h-1.5 mt-2"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">{stats.totalDrivers}</div>
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="text-xs">
                <div className="font-semibold text-emerald-500">{stats.activeDrivers}</div>
                <div className="text-muted-foreground">Active</div>
              </div>
              <div className="text-xs">
                <div className="font-semibold text-orange-400">{stats.onDutyDrivers}</div>
                <div className="text-muted-foreground">On Duty</div>
              </div>
              <div className="text-xs">
                <div className="font-semibold text-slate-500">{stats.offDrivers}</div>
                <div className="text-muted-foreground">Off</div>
              </div>
            </div>
            <Progress 
              value={stats.activeDrivers / stats.totalDrivers * 100} 
              className="h-1.5 mt-2"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Rentals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">{stats.activeRentals}</div>
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              {stats.activeRentals} vehicles currently on the road
            </div>
            <Progress 
              value={stats.activeRentals / stats.totalVehicles * 100} 
              className="h-1.5 mt-2"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Rentals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">{stats.totalRentals}</div>
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              Lifetime rental transactions
            </div>
            <Progress 
              value={100} 
              className="h-1.5 mt-2"
            />
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active Rentals</TabsTrigger>
          <TabsTrigger value="recent">Recent Rentals</TabsTrigger>
          <TabsTrigger value="popular">Popular Vehicles</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Rentals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentRentals.slice(0, 2).map(rental => (
                  <div key={rental.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{rental.renterName}</p>
                      <p className="text-sm text-muted-foreground">{rental.destination}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Return: {new Date(rental.endDate).toLocaleDateString()}</p>
                      <p className={`text-xs ${rental.paymentStatus === 'paid' ? 'text-emerald-500' : 'text-orange-400'}`}>
                        {rental.paymentStatus.charAt(0).toUpperCase() + rental.paymentStatus.slice(1)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Rentals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentRentals.map(rental => (
                  <div key={rental.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{rental.renterName}</p>
                      <p className="text-sm text-muted-foreground">{rental.destination}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{new Date(rental.created_at).toLocaleDateString()}</p>
                      <p className={`text-xs ${rental.paymentStatus === 'paid' ? 'text-emerald-500' : 'text-orange-400'}`}>
                        {rental.paymentStatus.charAt(0).toUpperCase() + rental.paymentStatus.slice(1)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="popular">
          <Card>
            <CardHeader>
              <CardTitle>Popular Vehicles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {popularVehicles.map(vehicle => (
                  <div key={vehicle.id} className="border rounded-lg overflow-hidden">
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={vehicle.photoUrl} 
                        alt={vehicle.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <p className="font-medium">{vehicle.name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                          {vehicle.type.toUpperCase()}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          vehicle.status === 'available' 
                            ? 'bg-emerald-100 text-emerald-600' 
                            : vehicle.status === 'rented'
                            ? 'bg-orange-100 text-orange-600'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {vehicle.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
