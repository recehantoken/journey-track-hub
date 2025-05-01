
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Vehicle, Driver } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Car, Users, Calendar, MapPin } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import AdminCreator from '@/components/AdminCreator';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    availableVehicles: 0,
    totalDrivers: 0,
    activeDrivers: 0,
    currentRentals: 0,
    trackedVehicles: 0
  });

  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch vehicles
        const { data: vehicles, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*');
        
        if (vehiclesError) throw vehiclesError;
        
        // Fetch drivers
        const { data: drivers, error: driversError } = await supabase
          .from('drivers')
          .select('*');
          
        if (driversError) throw driversError;
        
        // Fetch current rentals
        const { data: rentals, error: rentalsError } = await supabase
          .from('rentals')
          .select('*')
          .gte('end_date', new Date().toISOString());
          
        if (rentalsError) throw rentalsError;

        // Fetch tracked vehicles with location data
        const trackedVehicles = vehicles?.filter(
          v => v.current_location_lat !== null && v.current_location_lng !== null
        );
        
        // Update stats
        setStats({
          totalVehicles: vehicles?.length || 0,
          availableVehicles: vehicles?.filter(v => v.status === 'available').length || 0,
          totalDrivers: drivers?.length || 0,
          activeDrivers: drivers?.filter(d => d.status === 'active').length || 0,
          currentRentals: rentals?.length || 0,
          trackedVehicles: trackedVehicles?.length || 0
        });
        
      } catch (error: any) {
        toast("Error loading data", { 
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your fleet management dashboard</p>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVehicles}</div>
              <p className="text-xs text-muted-foreground">
                {stats.availableVehicles} available
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDrivers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeDrivers} active
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current Rentals</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.currentRentals}</div>
              <p className="text-xs text-muted-foreground">
                Active bookings
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tracked Vehicles</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.trackedVehicles}</div>
              <p className="text-xs text-muted-foreground">
                With GPS data
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Admin creator card */}
      <div className="mt-8">
        <AdminCreator />
      </div>
    </div>
  );
};

export default Index;
