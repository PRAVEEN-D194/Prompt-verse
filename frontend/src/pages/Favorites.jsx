import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/Card";
import { Heart, Trash2 } from "lucide-react";
import { favoriteService } from "../services/favoriteService";
import { Loader } from "../components/ui/Loader";
import { Button } from "../components/ui/Button";

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
      setFavorites(favorites.filter(fav => fav._id !== id));
    } catch (error) {
      console.error("Error removing favorite:", error);
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
          {favorites.map((fav) => (
            <Card key={fav._id} className="relative group">
              <div className="h-40 bg-muted">
                 <img 
                    src={fav.touristPlace?.images?.[0] || fav.hotel?.images?.[0] || "https://via.placeholder.com/300"} 
                    alt={fav.touristPlace?.name || fav.hotel?.name || "Favorite"} 
                    className="w-full h-full object-cover" 
                  />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg">{fav.touristPlace?.name || fav.hotel?.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {fav.itemType === 'tourist_place' ? 'Tourist Place' : 'Hotel'}
                </p>
                <Button 
                  variant="danger" 
                  size="icon" 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemove(fav._id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
