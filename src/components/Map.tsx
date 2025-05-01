
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  center: [number, number];
  markers?: {
    position: [number, number];
    popup?: string;
    icon?: L.Icon;
  }[];
  zoom?: number;
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

const Map = ({ center, markers = [], zoom = 13 }: MapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
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
    
    // Clear existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current?.removeLayer(layer);
      }
    });
    
    // Add new markers
    markers.forEach((marker) => {
      const { position, popup, icon } = marker;
      const mapMarker = L.marker(position, { icon: icon || busIcon }).addTo(mapRef.current!);
      
      if (popup) {
        mapMarker.bindPopup(popup);
      }
    });
  }, [markers]);
  
  return <div ref={mapContainerRef} className="h-full w-full rounded-md" style={{ minHeight: '400px' }} />;
};

export default Map;
