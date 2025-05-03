
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Driver, Rental, Vehicle } from "@/types";
import { seedDatabase } from "@/utils/sampleData";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Car, Users, Calendar, AlertTriangle, CheckCircle2, Truck, Clock } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalVehicles: 0,
    availableVehicles: 0,
    totalDrivers: 0,
    activeDrivers: 0,
    activeRentals: 0,
    totalRentals: 0,
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [seedingData, setSeedingData] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch vehicles
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (vehiclesError) throw vehiclesError;
      
      // Fetch drivers
      const { data: driversData, error: driversError } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (driversError) throw driversError;
      
      // Fetch rentals
      const { data: rentalsData, error: rentalsError } = await supabase
        .from('rentals')
        .select('*, vehicle:vehicles(*), driver:drivers(*)')
        .order('created_at', { ascending: false });
        
      if (rentalsError) throw rentalsError;
      
      // Calculate stats
      const availableVehicles = vehiclesData ? vehiclesData.filter(v => v.status === 'available').length : 0;
      const activeDrivers = driversData ? driversData.filter(d => d.status === 'active').length : 0;
      
      // Today's date in ISO format (truncated to date)
      const today = new Date().toISOString().split('T')[0];
      const activeRentals = rentalsData 
        ? rentalsData.filter(r => {
            const endDate = new Date(r.end_date).toISOString().split('T')[0];
            return endDate >= today;
          }).length 
        : 0;
      
      setVehicles(vehiclesData || []);
      setDrivers(driversData || []);
      setRentals(rentalsData || []);
      
      setStats({
        totalVehicles: vehiclesData ? vehiclesData.length : 0,
        availableVehicles,
        totalDrivers: driversData ? driversData.length : 0,
        activeDrivers,
        activeRentals,
        totalRentals: rentalsData ? rentalsData.length : 0,
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    try {
      setSeedingData(true);
      await seedDatabase();
      toast("Sample data created successfully");
      await fetchDashboardData();
    } catch (error) {
      console.error('Error seeding data:', error);
      toast("Failed to create sample data");
    } finally {
      setSeedingData(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col space-y-6 p-1 sm:p-2 md:p-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.email}</p>
        </div>
        
        {/* Stats overview cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-2">
                <Car className="h-8 w-8 text-primary" />
                <p className="text-sm text-muted-foreground">Total Vehicles</p>
                <h2 className="text-3xl font-bold">{stats.totalVehicles}</h2>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <p className="text-sm text-muted-foreground">Available</p>
                <h2 className="text-3xl font-bold">{stats.availableVehicles}</h2>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-2">
                <Users className="h-8 w-8 text-primary" />
                <p className="text-sm text-muted-foreground">Total Drivers</p>
                <h2 className="text-3xl font-bold">{stats.totalDrivers}</h2>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <p className="text-sm text-muted-foreground">Active Drivers</p>
                <h2 className="text-3xl font-bold">{stats.activeDrivers}</h2>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-2">
                <Calendar className="h-8 w-8 text-primary" />
                <p className="text-sm text-muted-foreground">Active Rentals</p>
                <h2 className="text-3xl font-bold">{stats.activeRentals}</h2>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-2">
                <Clock className="h-8 w-8 text-primary" />
                <p className="text-sm text-muted-foreground">Total Rentals</p>
                <h2 className="text-3xl font-bold">{stats.totalRentals}</h2>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Empty state with seed data option if no data */}
        {!loading && stats.totalVehicles === 0 && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Your fleet is empty</CardTitle>
              <CardDescription>Let's add some sample data to get started</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              <Button 
                onClick={handleSeedData} 
                disabled={seedingData}
              >
                {seedingData ? 'Creating Sample Data...' : 'Create Sample Data'}
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Recent activity tabs */}
        {stats.totalVehicles > 0 && (
          <Tabs defaultValue="vehicles" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="vehicles">Recent Vehicles</TabsTrigger>
              <TabsTrigger value="drivers">Recent Drivers</TabsTrigger>
              <TabsTrigger value="rentals">Recent Rentals</TabsTrigger>
            </TabsList>
            
            <TabsContent value="vehicles">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    <span>Recent Vehicles</span>
                  </CardTitle>
                  <CardDescription>
                    Your most recently added vehicles
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {vehicles.slice(0, 5).map(vehicle => (
                    <div key={vehicle.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">{vehicle.name}</p>
                        <p className="text-sm text-muted-foreground">{vehicle.license_plate}</p>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          vehicle.status === 'available' 
                            ? 'bg-green-100 text-green-800' 
                            : vehicle.status === 'rented' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {vehicle.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="drivers">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span>Recent Drivers</span>
                  </CardTitle>
                  <CardDescription>
                    Your most recently added drivers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {drivers.slice(0, 5).map(driver => (
                    <div key={driver.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">{driver.full_name}</p>
                        <p className="text-sm text-muted-foreground">{driver.phone_number}</p>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          driver.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : driver.status === 'on-duty' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {driver.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="rentals">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span>Recent Rentals</span>
                  </CardTitle>
                  <CardDescription>
                    Your most recent rental bookings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {rentals.slice(0, 5).map(rental => (
                    <div key={rental.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">{rental.destination}</p>
                        <p className="text-sm text-muted-foreground">{rental.renter_name}</p>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          rental.payment_status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : rental.payment_status === 'pending' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {rental.payment_status}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
