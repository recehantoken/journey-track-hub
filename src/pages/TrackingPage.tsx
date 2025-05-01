
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
import { MapPin, Navigation } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const TrackingPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // Mock data - would be replaced with API call
    const mockVehicles: Vehicle[] = [
      {
        id: '1',
        name: 'Big Traveler',
        type: 'bus',
        licensePlate: 'B 1234 ABC',
        seats: 45,
        photoUrl: 'https://images.unsplash.com/photo-1469041797191-50ace28483c3',
        status: 'rented',
        currentLocation: {
          lat: -6.2088,
          lng: 106.8456
        }
      },
      {
        id: '2',
        name: 'Mini Bus',
        type: 'elf',
        licensePlate: 'B 5678 DEF',
        seats: 20,
        photoUrl: 'https://images.unsplash.com/photo-1493962853295-0fd70327578a',
        status: 'rented',
        currentLocation: {
          lat: -6.1751,
          lng: 106.8650
        }
      },
      {
        id: '3',
        name: 'City Shuttle',
        type: 'hi-ace',
        licensePlate: 'B 9012 GHI',
        seats: 16,
        photoUrl: 'https://images.unsplash.com/photo-1493962853295-0fd70327578a',
        status: 'rented',
        currentLocation: {
          lat: -6.2297,
          lng: 106.8252
        }
      }
    ];
    
    setVehicles(mockVehicles);
    if (mockVehicles.length > 0) {
      setSelectedVehicle(mockVehicles[0].id);
    }
  }, []);

  // This is a placeholder for actual map implementation
  // In a real app, we would use the useEffect hook to initialize the map
  // and update markers when selectedVehicle changes
  
  // Simulating map loading
  useEffect(() => {
    const timer = setTimeout(() => setMapReady(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const selectedVehicleData = selectedVehicle 
    ? vehicles.find(v => v.id === selectedVehicle) 
    : null;

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
              <div className="aspect-video bg-muted rounded-md flex items-center justify-center relative">
                {!mapReady && (
                  <div className="text-center space-y-2">
                    <Navigation className="h-8 w-8 mx-auto animate-pulse text-primary" />
                    <p>Loading map...</p>
                  </div>
                )}
                {mapReady && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="mb-2">Map integration with Leaflet would be implemented here.</p>
                      <p>Current location of <strong>{selectedVehicleData?.name}</strong></p>
                      {selectedVehicleData?.currentLocation && (
                        <p className="text-sm text-muted-foreground">
                          Lat: {selectedVehicleData.currentLocation.lat}, 
                          Lng: {selectedVehicleData.currentLocation.lng}
                        </p>
                      )}
                      <div className="mt-4">
                        <MapPin className="h-8 w-8 text-primary mx-auto animate-bounce" />
                      </div>
                    </div>
                  </div>
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
                      <div className="text-lg">{selectedVehicleData.licensePlate}</div>
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
                        {selectedVehicleData.currentLocation
                          ? `Lat: ${selectedVehicleData.currentLocation.lat}, Lng: ${selectedVehicleData.currentLocation.lng}`
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
                          {vehicle.name} ({vehicle.licensePlate})
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
                          <div className="text-xs text-muted-foreground">{vehicle.licensePlate}</div>
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
