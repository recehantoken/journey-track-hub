
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { Vehicle, TrackingData } from '@/types';
import Map from '@/components/Map';
import { Loader2, Car } from 'lucide-react';

const TrackingPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<TrackingData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveTracking, setIsLiveTracking] = useState(false);

  // Fetch vehicles from Supabase
  useEffect(() => {
    const fetchVehicles = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*');
        
        if (error) throw error;
        
        if (data) {
          setVehicles(data);
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        toast("Failed to fetch vehicles", {
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVehicles();
  }, []);

  // Fetch tracking history for selected vehicle
  useEffect(() => {
    if (!selectedVehicle) return;
    
    const fetchTrackingHistory = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('tracking_history')
          .select('*')
          .eq('vehicle_id', selectedVehicle)
          .order('timestamp', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          setTrackingData(data);
        }
      } catch (error) {
        console.error('Error fetching tracking history:', error);
        toast("Failed to fetch tracking history", {
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTrackingHistory();
  }, [selectedVehicle]);

  // Connect to Traccar API and start live tracking
  const startLiveTracking = async () => {
    if (!selectedVehicle) {
      toast("Please select a vehicle to track");
      return;
    }
    
    setIsLiveTracking(true);
    toast("Live tracking has been activated for the selected vehicle");
  };

  // Stop live tracking
  const stopLiveTracking = () => {
    setIsLiveTracking(false);
    toast("Live tracking has been deactivated");
  };

  // Generate map markers from tracking data
  const mapMarkers = trackingData.map(point => {
    const vehicle = vehicles.find(v => v.id === point.vehicle_id);
    return {
      position: [point.latitude, point.longitude] as [number, number],
      popup: `
        <div>
          <h3>${vehicle?.name || 'Unknown Vehicle'}</h3>
          <p>License Plate: ${vehicle?.license_plate || 'N/A'}</p>
          <p>Time: ${new Date(point.timestamp).toLocaleString()}</p>
        </div>
      `,
      vehicleId: point.vehicle_id
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Vehicle Tracking</h1>
          <p className="text-muted-foreground">Track your fleet in real-time</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Tracking Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="vehicle-select">Select Vehicle</label>
              <Select 
                value={selectedVehicle || ''} 
                onValueChange={setSelectedVehicle}
              >
                <SelectTrigger id="vehicle-select">
                  <SelectValue placeholder="Select vehicle to track" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map(vehicle => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} ({vehicle.license_plate})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              {isLiveTracking ? (
                <Button variant="destructive" onClick={stopLiveTracking}>
                  Stop Live Tracking
                </Button>
              ) : (
                <Button onClick={startLiveTracking} disabled={!selectedVehicle}>
                  Start Live Tracking
                </Button>
              )}
            </div>
            
            {trackingData.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Last Update</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(trackingData[0].timestamp).toLocaleString()}
                </p>
                <div className="mt-2">
                  <p className="text-sm">Latitude: {trackingData[0].latitude.toFixed(6)}</p>
                  <p className="text-sm">Longitude: {trackingData[0].longitude.toFixed(6)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3">
          <CardContent className="p-4">
            <div className="h-[600px]">
              <Map 
                center={trackingData.length > 0 ? [trackingData[0].latitude, trackingData[0].longitude] : [-6.175110, 106.865036]} 
                markers={mapMarkers}
                liveTracking={isLiveTracking}
                refreshInterval={5000}
                zoom={12}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrackingPage;
