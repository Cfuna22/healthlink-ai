import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import { type ClinicSearchResult } from "@shared/schema";

interface ClinicMapProps {
  clinics: ClinicSearchResult[];
}

export default function ClinicMap({ clinics }: ClinicMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    // Initialize Google Maps when the component mounts
    const initMap = () => {
      if (!mapRef.current) return;

      const defaultCenter = { lat: 40.7128, lng: -74.0060 }; // New York City
      
      googleMapRef.current = new google.maps.Map(mapRef.current, {
        zoom: 12,
        center: defaultCenter,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
    };

    // Load Google Maps script if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      // Make initMap globally available
      (window as any).initMap = initMap;
      
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, []);

  useEffect(() => {
    if (!googleMapRef.current || !clinics.length) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers for each clinic
    const bounds = new google.maps.LatLngBounds();
    
    clinics.forEach((result, index) => {
      const { clinic } = result;
      const position = {
        lat: parseFloat(clinic.latitude),
        lng: parseFloat(clinic.longitude),
      };

      const marker = new google.maps.Marker({
        position,
        map: googleMapRef.current,
        title: clinic.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: index === 0 ? '#dc2626' : '#3b82f6', // Red for first result, blue for others
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-3 max-w-xs">
            <h3 class="font-semibold text-sm mb-1">${clinic.name}</h3>
            <p class="text-xs text-gray-600 mb-2">${clinic.address}</p>
            ${clinic.rating ? `<div class="flex items-center gap-1 text-xs">
              <span>⭐</span>
              <span>${clinic.rating}.0</span>
            </div>` : ''}
            ${clinic.hours ? `<p class="text-xs text-gray-500 mt-1">${clinic.hours}</p>` : ''}
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(googleMapRef.current, marker);
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    // Fit map to show all markers
    if (clinics.length > 1) {
      googleMapRef.current.fitBounds(bounds);
    } else if (clinics.length === 1) {
      googleMapRef.current.setCenter({
        lat: parseFloat(clinics[0].clinic.latitude),
        lng: parseFloat(clinics[0].clinic.longitude),
      });
      googleMapRef.current.setZoom(15);
    }
  }, [clinics]);

  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center" data-testid="map-placeholder">
        <div className="text-center space-y-4">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-medium text-foreground">Interactive Map</h3>
            <p className="text-sm text-muted-foreground">
              Google Maps integration requires an API key
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full"
      data-testid="google-map"
    />
  );
}
