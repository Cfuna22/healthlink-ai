import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, MapPin, Star, Clock, Phone, Globe } from "lucide-react";
import ClinicMap from "@/components/clinic-map";
import { type ClinicSearchResult } from "@shared/schema";

export default function Clinics() {
  const [location, setLocation] = useState("");
  const [clinicType, setClinicType] = useState("");
  const [distance, setDistance] = useState("10");
  const [searchResults, setSearchResults] = useState<ClinicSearchResult[]>([]);
  const { toast } = useToast();

  const searchClinics = useMutation({
    mutationFn: async (searchData: any) => {
      const response = await apiRequest("POST", "/api/clinics/search", searchData);
      return response.json();
    },
    onSuccess: (data) => {
      setSearchResults(data);
      toast({
        title: "Search Complete",
        description: `Found ${data.length} clinic(s) in your area.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Search Failed",
        description: error.message || "Failed to search for clinics. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location.trim()) {
      toast({
        title: "Location Required",
        description: "Please enter your location to search for clinics.",
        variant: "destructive",
      });
      return;
    }

    searchClinics.mutate({
      location: location.trim(),
      radius: parseInt(distance),
      type: clinicType || undefined,
    });
  };

  const formatDistance = (distance: number) => {
    if (distance === 0) return "";
    return distance < 1 ? `${(distance * 5280).toFixed(0)} ft` : `${distance.toFixed(1)} mi`;
  };

  const getStatusColor = (hours: string | null) => {
    if (!hours) return "text-muted-foreground";
    if (hours.toLowerCase().includes('open') || hours.toLowerCase().includes('24')) {
      return "text-green-600";
    }
    if (hours.toLowerCase().includes('close')) {
      return "text-red-600";
    }
    return "text-muted-foreground";
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Find Nearby Clinics
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Locate healthcare facilities near you with integrated maps and detailed information.
        </p>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Search and Filters */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <Input 
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter your location"
                      className="pl-10"
                      data-testid="input-location"
                    />
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clinicType">Clinic Type</Label>
                  <Select value={clinicType} onValueChange={setClinicType}>
                    <SelectTrigger data-testid="select-clinic-type">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="general">General Practice</SelectItem>
                      <SelectItem value="urgent">Urgent Care</SelectItem>
                      <SelectItem value="specialist">Specialist</SelectItem>
                      <SelectItem value="hospital">Hospital</SelectItem>
                      <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="distance">Distance</Label>
                  <Select value={distance} onValueChange={setDistance}>
                    <SelectTrigger data-testid="select-distance">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Within 5 miles</SelectItem>
                      <SelectItem value="10">Within 10 miles</SelectItem>
                      <SelectItem value="25">Within 25 miles</SelectItem>
                      <SelectItem value="50">Within 50 miles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={searchClinics.isPending}
                  data-testid="button-search-clinics"
                >
                  {searchClinics.isPending ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search Clinics
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Clinic Results List */}
          {searchResults.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="font-semibold text-foreground">Search Results</h3>
              {searchResults.map((result) => (
                <Card 
                  key={result.clinic.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  data-testid={`clinic-card-${result.clinic.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-foreground" data-testid="text-clinic-name">
                        {result.clinic.name}
                      </h4>
                      {result.distance > 0 && (
                        <span className="text-sm text-muted-foreground" data-testid="text-clinic-distance">
                          {formatDistance(result.distance)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2" data-testid="text-clinic-address">
                      {result.clinic.address}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        {result.clinic.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span data-testid="text-clinic-rating">{result.clinic.rating}.0</span>
                          </div>
                        )}
                        <Badge variant="outline" data-testid="badge-clinic-type">
                          {result.clinic.type}
                        </Badge>
                      </div>
                      {result.clinic.hours && (
                        <div className={`flex items-center space-x-1 ${getStatusColor(result.clinic.hours)}`}>
                          <Clock className="h-4 w-4" />
                          <span data-testid="text-clinic-hours">{result.clinic.hours}</span>
                        </div>
                      )}
                    </div>
                    {(result.clinic.phone || result.clinic.website) && (
                      <div className="flex items-center space-x-4 mt-2 pt-2 border-t text-sm">
                        {result.clinic.phone && (
                          <div className="flex items-center space-x-1 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span data-testid="text-clinic-phone">{result.clinic.phone}</span>
                          </div>
                        )}
                        {result.clinic.website && (
                          <div className="flex items-center space-x-1 text-primary">
                            <Globe className="h-4 w-4" />
                            <span className="text-sm">Website</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        {/* Map Container */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg overflow-hidden h-[600px]">
            <ClinicMap clinics={searchResults} />
          </Card>
        </div>
      </div>
    </div>
  );
}
