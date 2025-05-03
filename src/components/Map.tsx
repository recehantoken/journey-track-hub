
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from "@/integrations/supabase/client";
import { Vehicle } from '@/types';
import { toast } from '@/components/ui/sonner';

interface MapProps {
  center: [number, number];
  markers?: {
    position: [number, number];
    popup?: string;
    icon?: L.Icon;
    vehicleId?: string;
  }[];
  zoom?: number;
  liveTracking?: boolean;
  refreshInterval?: number;
}

// Define vehicle icons
const busIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const carIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const hiaceIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const elfIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const getIconForVehicleType = (type: string): L.Icon => {
  switch (type) {
    case 'bus':
      return busIcon;
    case 'car':
      return carIcon;
    case 'hi-ace':
      return hiaceIcon;
    case 'elf':
      return elfIcon;
    default:
      return busIcon;
  }
};

const Map = ({ center, markers = [], zoom = 13, liveTracking = false, refreshInterval = 10000 }: MapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{[key: string]: L.Marker}>({});
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  // Fetch vehicles data from Supabase
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setVehicles(data);
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        toast({
          description: "Failed to fetch vehicle data",
          variant: "destructive"
        });
      }
    };
    
    fetchVehicles();
  }, []);
  
  // Fetch tracking data from Traccar
  useEffect(() => {
    if (!liveTracking) return;
    
    const fetchTraccarData = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('traccar-api', {
          method: 'GET',
          body: { endpoint: 'positions' }
        });
        
        if (error) {
          throw error;
        }
        
        if (data && data.success) {
          // Update vehicle positions on map
          updateVehiclePositions(data.data);
        }
      } catch (error) {
        console.error('Error fetching Traccar data:', error);
      }
    };
    
    // Initial fetch
    fetchTraccarData();
    
    // Set up interval for live tracking
    const intervalId = setInterval(() => {
      fetchTraccarData();
    }, refreshInterval);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [liveTracking, refreshInterval]);
  
  const updateVehiclePositions = (positions: any[]) => {
    if (!mapRef.current) return;
    
    positions.forEach(position => {
      const vehicle = vehicles.find(v => v.id === position.deviceId);
      if (!vehicle) return;
      
      const lat = position.latitude;
      const lng = position.longitude;
      
      if (markersRef.current[vehicle.id]) {
        // Update existing marker
        markersRef.current[vehicle.id].setLatLng([lat, lng]);
      } else {
        // Create new marker
        const icon = getIconForVehicleType(vehicle.type);
        const marker = L.marker([lat, lng], { icon })
          .addTo(mapRef.current!)
          .bindPopup(`
            <div>
              <h3>${vehicle.name}</h3>
              <p>License Plate: ${vehicle.license_plate}</p>
              <p>Status: ${vehicle.status}</p>
              <p>Last Update: ${new Date().toLocaleTimeString()}</p>
            </div>
          `);
        
        markersRef.current[vehicle.id] = marker;
      }
    });
  };
  
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    
    // Initialize map
    mapRef.current = L.map(mapContainerRef.current).setView(center, zoom);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapRef.current);
    
    // Cleanup function to destroy map on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, zoom]);
  
  // Add/update markers when they change
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Clear existing markers that are not tracked
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker && !Object.values(markersRef.current).includes(layer)) {
        mapRef.current?.removeLayer(layer);
      }
    });
    
    // Add new markers
    markers.forEach((marker) => {
      const { position, popup, icon, vehicleId } = marker;
      
      // Skip if we're already tracking this vehicle
      if (vehicleId && markersRef.current[vehicleId]) return;
      
      // Create marker
      const mapMarker = L.marker(position, { icon: icon || busIcon }).addTo(mapRef.current!);
      
      // Add popup if provided
      if (popup) {
        mapMarker.bindPopup(popup);
      }
      
      // Store marker reference if it has a vehicleId
      if (vehicleId) {
        markersRef.current[vehicleId] = mapMarker;
      }
    });
  }, [markers]);
  
  return <div ref={mapContainerRef} className="h-full w-full rounded-md" style={{ minHeight: '400px' }} />;
};

export default Map;
