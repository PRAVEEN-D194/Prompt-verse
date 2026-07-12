import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { hotelService } from "../services/hotelService";
import { favoriteService } from "../services/favoriteService";
import { reviewService } from "../services/reviewService";
import { AuthContext } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Loader } from "../components/ui/Loader";
import { Building, MapPin, Star, Search, Heart } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export const Hotels = () => {
  const { user } = useContext(AuthContext);
  const [hotels, setHotels] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [hotelStats, setHotelStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchFavorites = async () => {
    if (!user || user.role !== "tourist") return;
    try {
      const res = await favoriteService.getFavorites();
      setFavorites(res.data.favorites || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const fetchHotelReviews = async (hotelsList) => {
    try {
      const reviewsPromises = hotelsList.map(h => reviewService.getReviews({ hotelId: h.id }));
      const reviewsResults = await Promise.all(reviewsPromises);
      const stats = {};
      reviewsResults.forEach((res, idx) => {
        const hotel = hotelsList[idx];
        const hotelReviews = res.data.reviews || [];
        const avg = hotelReviews.length > 0
          ? (hotelReviews.reduce((sum, r) => sum + r.rating, 0) / hotelReviews.length).toFixed(1)
          : Number(hotel.rating || 0).toFixed(1);
        stats[hotel.id] = {
          count: hotelReviews.length,
          rating: avg === "0.0" ? "New" : avg
        };
      });
      setHotelStats(stats);
    } catch (error) {
      console.error("Error fetching hotel reviews:", error);
    }
  };

  const fetchHotels = async (query = "") => {
    setLoading(true);
    try {
      const res = await hotelService.getAllHotels({ search: query });
      let filtered = res.data || [];
      if (query) {
        const lowerQ = query.toLowerCase();
        filtered = filtered.filter(h =>
          h.name?.toLowerCase().includes(lowerQ) ||
          h.address?.toLowerCase().includes(lowerQ)
        );
      }
      setHotels(filtered);
      await Promise.all([
        fetchFavorites(),
        fetchHotelReviews(filtered)
      ]);
    } catch (error) {
      console.error("Error fetching hotels:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [user]);

  const handleToggleFavorite = async (e, hotelId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert("Please log in to save favorites.");
      return;
    }

    const existingFav = favorites.find(fav => fav.hotel_id === hotelId);

    try {
      if (existingFav) {
        await favoriteService.deleteFavorite(existingFav.id);
        setFavorites(prev => prev.filter(fav => fav.id !== existingFav.id));
      } else {
        const res = await favoriteService.addFavorite({ hotelId });
        setFavorites(prev => [...prev, res.data.favorite]);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Failed to update favorite status.");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHotels(searchQuery);
  };

  const getHotelImage = (hotel) => {
    if (hotel.image_url) return hotel.image_url;
    if (hotel.image) return hotel.image;
    if (hotel.images && hotel.images[0]) return hotel.images[0];
    return "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80";
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
        {hotels.map((hotel) => {
          const stats = hotelStats[hotel.id] || { rating: hotel.rating || "New", count: 0 };
          const isFav = favorites.some(fav => fav.hotel_id === hotel.id);
          const imageUrl = getHotelImage(hotel);

          return (
            <Card key={hotel.id} className="overflow-hidden flex flex-col relative group">
              <div className="h-48 bg-muted relative overflow-hidden">
                <img src={imageUrl} alt={hotel.name} className="w-full h-full object-cover" loading="lazy" />
                {user && user.role === "tourist" && (
                  <button
                    onClick={(e) => handleToggleFavorite(e, hotel.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white text-red-500 transition-colors z-20"
                    title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
                  </button>
                )}
              </div>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span className="truncate pr-2">{hotel.name}</span>
                  <span className="flex items-center text-sm font-medium text-accent whitespace-nowrap">
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    {stats.rating}
                    {stats.count > 0 && <span className="text-muted-foreground text-xs ml-1">({stats.count})</span>}
                  </span>
                </CardTitle>
                <CardDescription className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{hotel.address || "Location not available"}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end">
                {/* <div className="flex justify-between items-end mb-4">
                  <p className="text-sm text-muted-foreground">Starting from</p>
                  <p className="text-xl font-bold text-primary">${hotel.pricePerNight || "120"}<span className="text-sm font-normal text-muted-foreground">/night</span></p>
                </div> */}
                <div className="flex gap-2">
                  <Link to={`/hotels/${hotel.id}`} className="flex-1">
                    <Button className="w-full">View Details</Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="text-xs"
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + " " + hotel.address)}`, '_blank')}
                  >
                    Map
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {hotels.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No hotels available at the moment.
          </div>
        )}
      </div>
    </div>
  );
};
