import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/Card";
import { Heart, Trash2, Star, MapPin } from "lucide-react";
import { favoriteService } from "../services/favoriteService";
import { Loader } from "../components/ui/Loader";
import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";

export const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const res = await favoriteService.getFavorites();
      setFavorites(res.data.favorites || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemove = async (id) => {
    try {
      await favoriteService.deleteFavorite(id);
      setFavorites(favorites.filter(fav => fav.id !== id));
    } catch (error) {
      console.error("Error removing favorite:", error);
      alert("Failed to remove from favorites.");
    }
  };

  if (loading) return <div className="pt-20"><Loader /></div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold flex items-center">
        <Heart className="mr-2 text-red-500 fill-current" /> My Favorites
      </h1>
      
      {favorites.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            You haven't saved any places or hotels to your favorites yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => {
            const isHotel = !!fav.hotel_id;
            const name = isHotel ? fav.hotel_name : fav.place_name;
            const locationText = isHotel ? fav.hotel_address : fav.place_location;
            const categoryText = isHotel ? "Hotel" : fav.place_category || "Tourist Place";
            const id = isHotel ? fav.hotel_id : fav.place_id;
            
            const getImageUrl = () => {
              const nameLower = (name || "").toLowerCase();
              const locLower = (locationText || "").toLowerCase();
              if (isHotel) {
                if (nameLower.includes("beach") || nameLower.includes("resort") || locLower.includes("beach")) {
                  return "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500&auto=format&fit=crop&q=60";
                }
                if (nameLower.includes("palace") || nameLower.includes("royal") || nameLower.includes("heritage") || nameLower.includes("grand")) {
                  return "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=500&auto=format&fit=crop&q=60";
                }
                if (nameLower.includes("lodge") || nameLower.includes("cottage") || nameLower.includes("hill") || nameLower.includes("mountain") || nameLower.includes("retreat")) {
                  return "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=500&auto=format&fit=crop&q=60";
                }
                return "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=60";
              } else {
                if (nameLower.includes("mysore") || nameLower.includes("mysuru") || nameLower.includes("palace")) {
                  return "https://images.unsplash.com/photo-1590050752117-238cb061295a?w=500&auto=format&fit=crop&q=60";
                }
                if (nameLower.includes("marina") || nameLower.includes("beach")) {
                  return "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=500&auto=format&fit=crop&q=60";
                }
                if (nameLower.includes("ooty") || nameLower.includes("lake")) {
                  return "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=500&auto=format&fit=crop&q=60";
                }
                if (nameLower.includes("meenakshi") || nameLower.includes("temple")) {
                  return "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=500&auto=format&fit=crop&q=60";
                }
                if (nameLower.includes("kaziranga") || nameLower.includes("national park") || (categoryText || "").toLowerCase().includes("wildlife")) {
                  return "https://images.unsplash.com/photo-1581888227599-779811939961?w=500&auto=format&fit=crop&q=60";
                }
                return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60";
              }
            };

            const imageUrl = getImageUrl();

            return (
              <Card key={fav.id} className="relative group overflow-hidden flex flex-col h-full">
                <div className="h-40 bg-muted flex-shrink-0">
                  <img 
                    src={imageUrl} 
                    alt={name || "Favorite"} 
                    className="w-full h-full object-cover" 
                    loading="lazy"
                  />
                </div>
                <CardContent className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-lg truncate mb-1">{name || "Favorite Item"}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase ${
                        isHotel ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"
                      }`}>
                        {categoryText}
                      </span>
                      <span className="truncate flex items-center gap-0.5">
                        <MapPin size={10} /> {locationText}
                      </span>
                    </p>
                    
                    {isHotel && fav.hotel_rating && (
                      <div className="flex items-center text-xs font-semibold text-amber-500 mb-4">
                        <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                        {fav.hotel_rating}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-auto pt-4 border-t gap-2">
                    {isHotel ? (
                      <Link to={`/hotels/${id}`} className="flex-1">
                        <Button className="w-full h-8 text-xs">View Details</Button>
                      </Link>
                    ) : (
                      <Link to="/places" className="flex-1">
                        <Button variant="outline" className="w-full h-8 text-xs">View Places</Button>
                      </Link>
                    )}
                    <Button 
                      variant="danger" 
                      size="icon" 
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRemove(fav.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
