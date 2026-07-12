import React, { useState, useEffect } from "react";
import { placeService } from "../services/placeService";
import { reviewService } from "../services/reviewService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Loader } from "../components/ui/Loader";
import { MapPin, Star, Search } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Link } from "react-router-dom";

export const TouristPlaces = () => {
  const [places, setPlaces] = useState([]);
  const [placeStats, setPlaceStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPlaceReviews = async (placesList) => {
    try {
      const reviewsPromises = placesList.map(p => reviewService.getReviews({ placeId: p.id }));
      const reviewsResults = await Promise.all(reviewsPromises);
      const stats = {};
      reviewsResults.forEach((res, idx) => {
        const place = placesList[idx];
        const placeReviews = res.data.reviews || [];
        const avg = placeReviews.length > 0
          ? (placeReviews.reduce((sum, r) => sum + r.rating, 0) / placeReviews.length).toFixed(1)
          : Number(place.average_rating || 0).toFixed(1);
        stats[place.id] = {
          count: placeReviews.length,
          rating: avg === "0.0" ? "New" : avg
        };
      });
      setPlaceStats(stats);
    } catch (error) {
      console.error("Error fetching place reviews:", error);
    }
  };

  const fetchPlaces = async (query = "") => {
    setLoading(true);
    try {
      const res = await placeService.getAllPlaces({ search: query });
      let filtered = res.data || [];
      if (query) {
        const lowerQ = query.toLowerCase();
        filtered = filtered.filter(p => 
          p.name?.toLowerCase().includes(lowerQ) ||
          p.category?.toLowerCase().includes(lowerQ) ||
          p.location?.toLowerCase().includes(lowerQ)
        );
      }
      setPlaces(filtered);
      await fetchPlaceReviews(filtered);
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

  const getPlaceImage = (place) => {
    if (place.image_url) return place.image_url;
    if (place.image) return place.image;
    if (place.images && place.images[0]) return place.images[0];
    
    const category = place.category?.toLowerCase() || "";
    const name = place.name?.toLowerCase() || "";
    
    if (category.includes("wildlife") || category.includes("park") || name.includes("national park")) {
      return "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&auto=format&fit=crop&q=80";
    }
    if (category.includes("beach") || name.includes("beach")) {
      return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80";
    }
    if (category.includes("lake") || name.includes("lake")) {
      return "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop&q=80";
    }
    if (category.includes("historic") || category.includes("heritage") || category.includes("temple") || category.includes("museum")) {
      return "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=80";
    }
    if (category.includes("nature") || category.includes("hill") || category.includes("mountain")) {
      return "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80";
    }
    
    return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop&q=80";
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
        {places.map((place) => {
          const stats = placeStats[place.id] || { rating: place.average_rating || "New", count: 0 };
          const imageUrl = getPlaceImage(place);
          
          return (
            <Card key={place.id} className="overflow-hidden flex flex-col justify-between">
              <div>
                <div className="h-48 bg-muted relative">
                  <img src={imageUrl} alt={place.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span className="truncate pr-2">{place.name}</span>
                    <span className="flex items-center text-sm font-medium text-accent whitespace-nowrap">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      {stats.rating}
                      {stats.count > 0 && <span className="text-muted-foreground text-xs ml-1">({stats.count})</span>}
                    </span>
                  </CardTitle>
                  <CardDescription className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" /> {place.location || "Unknown Location"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {place.description}
                  </p>
                </CardContent>
              </div>
              <div className="px-6 pb-6">
                <Link to={`/places/${place.id}`} className="w-full">
                  <Button variant="outline" className="w-full">View Details</Button>
                </Link>
              </div>
            </Card>
          );
        })}
        {places.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No places found.
          </div>
        )}
      </div>
    </div>
  );
};
