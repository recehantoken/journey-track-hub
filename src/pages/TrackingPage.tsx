import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Vehicle } from '@/types';
import { Badge } from '@/components/ui/badge';
import Map from '@/components/Map';
import { supabase } from '@/integrations/supabase/client';

const TrackingPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch vehicles from Supabase
  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const { data: vehiclesData, error } = await supabase
          .from('vehicles')
          .select('*')
          .order('name');
          
        if (error) throw error;
        
        if (vehiclesData) {
          // Transform data to match our Vehicle interface
          const transformedVehicles: Vehicle[] = vehiclesData.map(v => ({
            ...v,
            licensePlate: v.license_plate, // For backward compatibility
            photoUrl: v.photo_url // For backward compatibility
          }));
          
          setVehicles(transformedVehicles);
          
          // Select first vehicle with status 'rented' by default
          const rentedVehicle = transformedVehicles.find(v => v.status === 'rented');
          if (rentedVehicle) {
            setSelectedVehicle(rentedVehicle.id);
          } else if (transformedVehicles.length > 0) {
            setSelectedVehicle(transformedVehicles[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const selectedVehicleData = selectedVehicle 
    ? vehicles.find(v => v.id === selectedVehicle) 
    : null;

  // Prepare map markers for the selected vehicle
  const mapMarkers = selectedVehicleData && selectedVehicleData.current_location_lat && selectedVehicleData.current_location_lng
    ? [{
        position: [selectedVehicleData.current_location_lat, selectedVehicleData.current_location_lng] as [number, number],
        popup: `${selectedVehicleData.name} (${selectedVehicleData.license_plate})`,
        icon: selectedVehicleData.type === 'car' ? undefined : undefined // Use icon based on vehicle type
      }]
    : [];

  // Jakarta center coordinates as fallback
  const mapCenter = selectedVehicleData && selectedVehicleData.current_location_lat && selectedVehicleData.current_location_lng
    ? [selectedVehicleData.current_location_lat, selectedVehicleData.current_location_lng] as [number, number]
    : [-6.2088, 106.8456] as [number, number];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">GPS Tracking</h1>
        <p className="text-muted-foreground">Track your vehicles in real-time</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-6 order-2 lg:order-1 lg:col-span-3">
          <Card className="w-full">
            <CardHeader className="pb-0">
              <CardTitle>Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-md relative">
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <Map 
                    center={mapCenter}
                    markers={mapMarkers}
                    zoom={13}
                  />
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Journey Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedVehicleData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm font-medium">Vehicle</div>
                      <div className="text-lg">{selectedVehicleData.name}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">License Plate</div>
                      <div className="text-lg">{selectedVehicleData.license_plate}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Type</div>
                      <div className="text-lg capitalize">{selectedVehicleData.type}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Status</div>
                      <Badge className={
                        selectedVehicleData.status === 'available' 
                          ? 'bg-emerald-500' 
                          : selectedVehicleData.status === 'rented' 
                          ? 'bg-amber-500' 
                          : 'bg-slate-500'
                      }>
                        {selectedVehicleData.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium">Current Location</div>
                      <div className="text-muted-foreground">
                        {selectedVehicleData.current_location_lat && selectedVehicleData.current_location_lng
                          ? `Lat: ${selectedVehicleData.current_location_lat}, Lng: ${selectedVehicleData.current_location_lng}`
                          : 'Location not available'
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Speed</div>
                      <div className="text-muted-foreground">65 km/h (simulated)</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium">Journey Progress</div>
                    <div className="h-2 w-full bg-muted mt-1 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: '40%' }} 
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>Departed 40 minutes ago</span>
                      <span>Estimated arrival: 1h 20m</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Select a vehicle to view details
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="order-1 lg:order-2">
          <Card>
            <CardHeader>
              <CardTitle>Active Vehicles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Select 
                    value={selectedVehicle || ''} 
                    onValueChange={setSelectedVehicle}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.filter(v => v.status === 'rented').map(vehicle => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.name} ({vehicle.license_plate})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  {vehicles.filter(v => v.status === 'rented').map(vehicle => (
                    <Button
                      key={vehicle.id}
                      variant={selectedVehicle === vehicle.id ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setSelectedVehicle(vehicle.id)}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                          {vehicle.type === 'bus' && <span>🚌</span>}
                          {vehicle.type === 'elf' && <span>🚐</span>}
                          {vehicle.type === 'hi-ace' && <span>🚐</span>}
                          {vehicle.type === 'car' && <span>🚗</span>}
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{vehicle.name}</div>
                          <div className="text-xs text-muted-foreground">{vehicle.license_plate}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
                
                <div className="pt-2">
                  <div className="text-sm font-medium mb-2">Status Legend</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 mr-1" />
                      <span>Available</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-amber-500 mr-1" />
                      <span>Rented</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-slate-500 mr-1" />
                      <span>Service</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;
