import { type Clinic, type ClinicSearchResult } from "@shared/schema";

export class MapsService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.MAPS_API_KEY || "default_key";
  }

  // Geocode an address to get coordinates
  async geocodeAddress(address: string): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${this.apiKey}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng
        };
      }
      
      return null;
    } catch (error) {
      console.error("Error geocoding address:", error);
      return null;
    }
  }

  // Search for nearby places using Google Places API
  async searchNearbyHealthcare(
    latitude: number,
    longitude: number,
    radius: number = 10000, // 10km default
    type: string = 'hospital'
  ): Promise<Clinic[]> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${this.apiKey}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK') {
        return data.results.map((place: any) => ({
          id: place.place_id,
          name: place.name,
          address: place.vicinity,
          latitude: place.geometry.location.lat.toString(),
          longitude: place.geometry.location.lng.toString(),
          type: this.mapGoogleTypeToClinicType(type),
          rating: place.rating ? Math.round(place.rating) : null,
          hours: place.opening_hours?.open_now ? 'Open now' : 'Hours vary',
          phone: null,
          website: null,
        }));
      }
      
      return [];
    } catch (error) {
      console.error("Error searching nearby healthcare:", error);
      return [];
    }
  }

  // Get place details including contact information
  async getPlaceDetails(placeId: string): Promise<Partial<Clinic> | null> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,rating&key=${this.apiKey}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK') {
        const place = data.result;
        return {
          phone: place.formatted_phone_number || null,
          website: place.website || null,
          hours: place.opening_hours?.weekday_text?.join(', ') || 'Hours vary',
          rating: place.rating ? Math.round(place.rating) : null,
        };
      }
      
      return null;
    } catch (error) {
      console.error("Error getting place details:", error);
      return null;
    }
  }

  // Calculate driving directions between two points
  async getDirections(
    origin: string,
    destination: string
  ): Promise<{ duration: string; distance: string; steps: string[] } | null> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${this.apiKey}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.routes.length > 0) {
        const route = data.routes[0];
        const leg = route.legs[0];
        
        return {
          duration: leg.duration.text,
          distance: leg.distance.text,
          steps: leg.steps.map((step: any) => step.html_instructions)
        };
      }
      
      return null;
    } catch (error) {
      console.error("Error getting directions:", error);
      return null;
    }
  }

  private mapGoogleTypeToClinicType(googleType: string): string {
    const typeMap: { [key: string]: string } = {
      hospital: 'hospital',
      doctor: 'general',
      pharmacy: 'pharmacy',
      dentist: 'specialist',
      physiotherapist: 'specialist',
    };
    
    return typeMap[googleType] || 'general';
  }
}

export const mapsService = new MapsService();
