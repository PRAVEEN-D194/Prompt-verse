import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { hotelService } from "../services/hotelService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Loader } from "../components/ui/Loader";
import { Building, MapPin, Star, Search } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchHotels = async (query = "") => {
    setLoading(true);
    try {
      const res = await hotelService.getAllHotels({ search: query });
      let filtered = res.data;
      if (query) {
        const lowerQ = query.toLowerCase();
        filtered = filtered.filter(h => 
          h.name?.toLowerCase().includes(lowerQ) ||
          h.address?.toLowerCase().includes(lowerQ) ||
          h.location?.city?.toLowerCase().includes(lowerQ)
        );
      }
      setHotels(filtered);
    } catch (error) {
      console.error("Error fetching hotels:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHotels(searchQuery);
  };

  if (loading) return <div className="h-full pt-20"><Loader /></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Find the Perfect Stay</h1>
        <p className="text-muted-foreground mb-6">Browse through our top-rated hotels and accommodations</p>
        <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
          <Input 
            placeholder="Search hotels by name or location..." 
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
        {hotels.map((hotel) => (
          <Card key={hotel.id} className="overflow-hidden flex flex-col">
            <div className="h-48 bg-muted relative">
              {hotel.images && hotel.images[0] ? (
                <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                  <Building size={48} />
                </div>
              )}
            </div>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span className="truncate pr-2">{hotel.name}</span>
                <span className="flex items-center text-sm font-medium text-accent whitespace-nowrap">
                  <Star className="w-4 h-4 mr-1 fill-current" />
                  {hotel.rating || "New"}
                </span>
              </CardTitle>
              <CardDescription className="flex items-center">
                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">{hotel.address || "Location not available"}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end">
              <div className="flex justify-between items-end mb-4">
                <p className="text-sm text-muted-foreground">Starting from</p>
                <p className="text-xl font-bold text-primary">${hotel.pricePerNight || "1000"}<span className="text-sm font-normal text-muted-foreground">/night</span></p>
              </div>
              <Link to={`/hotels/${hotel.id}`}>
                <Button className="w-full">View Details</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
        {hotels.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No hotels available at the moment.
          </div>
        )}
      </div>
    </div>
  );
};
