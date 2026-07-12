import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { placeService } from "../services/placeService";
import { reviewService } from "../services/reviewService";
import { favoriteService } from "../services/favoriteService";
import { AuthContext } from "../context/AuthContext";
import { Loader } from "../components/ui/Loader";
import { Button } from "../components/ui/Button";
import { MapPin, Star, Heart, Clock, DollarSign, Cloud, MessageSquare, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";

export const PlaceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [place, setPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await reviewService.getReviews({ placeId: id });
      setReviews(res.data.reviews || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const fetchFavorites = async () => {
    if (!user || user.role !== "tourist") return;
    try {
      const res = await favoriteService.getFavorites();
      setFavorites(res.data.favorites || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const placeRes = await placeService.getPlaceById(id);
        setPlace(placeRes.data.place);
        await Promise.all([
          fetchReviews(),
          fetchFavorites()
        ]);
      } catch (error) {
        console.error("Error fetching place details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [id, user]);

  const handleToggleFavorite = async () => {
    if (!user) {
      alert("Please log in to save favorites.");
      return;
    }
    const existingFav = favorites.find(fav => fav.place_id === parseInt(id));
    try {
      if (existingFav) {
        await favoriteService.deleteFavorite(existingFav.id);
        setFavorites(prev => prev.filter(fav => fav.id !== existingFav.id));
      } else {
        const res = await favoriteService.addFavorite({ placeId: parseInt(id) });
        setFavorites(prev => [...prev, res.data.favorite]);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Failed to update favorite status.");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingReview(true);
    try {
      await reviewService.createReview({
        placeId: parseInt(id),
        rating: newRating,
        comment: newComment
      });
      setNewComment("");
      setNewRating(5);
      await fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(error.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="h-full pt-20"><Loader /></div>;
  if (!place) return <div className="text-center pt-20 text-muted-foreground">Place not found.</div>;

  const isFav = favorites.some(fav => fav.place_id === place.id);
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : Number(place.average_rating || 0).toFixed(1);

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

  const imageUrl = getPlaceImage(place);

  const isNature = place.category?.toLowerCase().includes("nature") || place.category?.toLowerCase().includes("park");
  const isHistoric = place.category?.toLowerCase().includes("history") || place.category?.toLowerCase().includes("temple");
  const openingHours = isNature ? "06:00 AM - 07:00 PM" : isHistoric ? "09:00 AM - 05:00 PM" : "09:00 AM - 06:00 PM";
  const entryFee = isNature ? "Free" : isHistoric ? "$15" : "$10";
  const weatherText = "☀️ 26°C, Sunny | Wind: 12 km/h | Humidity: 55%";

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link to="/places" className="inline-flex items-center text-sm font-medium text-primary hover:underline mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Destinations
      </Link>

      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{place.name}</h1>
          <div className="flex flex-wrap items-center text-muted-foreground gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span>{place.location}</span>
            <span className="mx-2 hidden sm:inline">|</span>
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
              {place.category || "Tourist Attraction"}
            </span>
            <span className="mx-2 hidden sm:inline">|</span>
            <span className="flex items-center text-amber-500 font-semibold">
              <Star className="w-5 h-5 mr-1 fill-current" />
              <span className="text-foreground">{avgRating === "0.0" ? "New" : avgRating}</span>
              <span className="text-muted-foreground text-sm font-normal ml-1">({reviews.length} reviews)</span>
            </span>
          </div>
        </div>
        {user && user.role === "tourist" && (
          <Button 
            variant={isFav ? "default" : "outline"} 
            className="flex items-center gap-2"
            onClick={handleToggleFavorite}
          >
            <Heart className={`w-4 h-4 ${isFav ? "fill-current text-red-500" : ""}`} />
            {isFav ? "Saved to Favorites" : "Add to Favorites"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Image */}
          <div className="h-[400px] rounded-2xl overflow-hidden bg-muted relative">
            <img 
              src={imageUrl} 
              alt={place.name} 
              className="w-full h-full object-cover" 
              loading="lazy"
            />
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">About this place</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {place.description}
            </p>
          </div>

          {/* Place Quick Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-slate-50/50">
              <CardContent className="p-4 flex items-center gap-3">
                <Clock className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Hours</p>
                  <p className="text-sm font-semibold">{openingHours}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-50/50">
              <CardContent className="p-4 flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Entry Fee</p>
                  <p className="text-sm font-semibold">{entryFee}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-50/50">
              <CardContent className="p-4 flex items-center gap-3">
                <Cloud className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Current Weather</p>
                  <p className="text-xs font-semibold">{weatherText}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reviews Section */}
          <div className="pt-6 border-t">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-primary" /> Reviews & Feedback
            </h2>

            {/* Review Form */}
            {user && user.role === "tourist" && (
              <Card className="mb-8 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Share Your Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Rating:</span>
                      <select 
                        value={newRating} 
                        onChange={(e) => setNewRating(parseInt(e.target.value))}
                        className="rounded border border-input p-1"
                      >
                        {[5, 4, 3, 2, 1].map(num => (
                          <option key={num} value={num}>{num} Stars</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write your review here..."
                        rows={3}
                        required
                        className="w-full rounded-md border border-input p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <Button type="submit" disabled={submittingReview}>
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Reviews Feed */}
            {reviews.length === 0 ? (
              <p className="text-muted-foreground">No reviews yet. Be the first to leave a review!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <Card key={rev.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-sm">{rev.username || "Guest Traveler"}</p>
                          <p className="text-xs text-muted-foreground">{new Date(rev.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center text-amber-500 text-sm font-semibold">
                          <Star className="w-4 h-4 mr-0.5 fill-current" />
                          {rev.rating}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{rev.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          {/* Side Map Card */}
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Location Map</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="w-full h-[350px] bg-slate-100 rounded-lg overflow-hidden flex flex-col items-center justify-center border text-center p-4">
                <MapPin className="w-10 h-10 text-primary mb-2 animate-bounce" />
                <p className="font-semibold text-sm mb-1">{place.name}</p>
                <p className="text-xs text-muted-foreground mb-4">{place.location}</p>
                
                {/* Embed a Google Map iframe centered around location */}
                <iframe
                  title="Google Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(place.name + " " + place.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                  allowFullScreen
                  className="rounded-md border mt-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
