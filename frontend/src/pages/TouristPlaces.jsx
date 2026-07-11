import React, { useState, useEffect } from "react";
import { placeService } from "../services/placeService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Loader } from "../components/ui/Loader";
import { MapPin, Star, Search } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export const TouristPlaces = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPlaces = async (query = "") => {
    setLoading(true);
    try {
      const res = await placeService.getAllPlaces({ search: query });
      let filtered = res.data;
      // Fallback frontend filtering in case the backend ignores the search param
      if (query) {
        const lowerQ = query.toLowerCase();
        filtered = filtered.filter(p => 
          p.name?.toLowerCase().includes(lowerQ) ||
          p.category?.toLowerCase().includes(lowerQ) ||
          p.location?.city?.toLowerCase().includes(lowerQ) ||
          p.location?.country?.toLowerCase().includes(lowerQ)
        );
      }
      setPlaces(filtered);
    } catch (error) {
      console.error("Error fetching places:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPlaces(searchQuery);
  };

  if (loading) return <div className="h-full pt-20"><Loader /></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Explore Destinations</h1>
        <p className="text-muted-foreground mb-6">Discover the most beautiful places around the world</p>
        <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
          <Input 
            placeholder="Search by name, category, or location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {places.map((place) => (
          <Card key={place._id} className="overflow-hidden flex flex-col">
            <div className="h-48 bg-muted relative">
              {place.images && place.images[0] ? (
                <img src={place.images[0]} alt={place.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary/20 text-secondary">
                  <MapPin size={48} />
                </div>
              )}
            </div>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{place.name}</span>
                <span className="flex items-center text-sm font-medium text-accent">
                  <Star className="w-4 h-4 mr-1 fill-current" />
                  {place.rating || "New"}
                </span>
              </CardTitle>
              <CardDescription className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" /> {place.location?.city || "Unknown Location"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                {place.description}
              </p>
              <Button variant="outline" className="w-full">View Details</Button>
            </CardContent>
          </Card>
        ))}
        {places.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No places found.
          </div>
        )}
      </div>
    </div>
  );
};
