import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { hotelService } from "../services/hotelService";
import { roomService } from "../services/roomService";
import { reviewService } from "../services/reviewService";
import { favoriteService } from "../services/favoriteService";
import { bookingService } from "../services/bookingService";
import { AuthContext } from "../context/AuthContext";
import { Loader } from "../components/ui/Loader";
import { Button } from "../components/ui/Button";
import { MapPin, Star, Wifi, Coffee, Car, Users, Check, Heart, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";

export const HotelDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await reviewService.getReviews({ hotelId: id });
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

  const fetchBookings = async () => {
    if (!user || user.role !== "tourist") return;
    try {
      const res = await bookingService.getMyBookings();
      setBookings(res.data.bookings || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [hotelRes, roomsRes] = await Promise.all([
          hotelService.getHotelById(id),
          roomService.getRoomsByHotel(id)
        ]);
        setHotel(hotelRes.data.hotel);
        setRooms(roomsRes.data.rooms || []);
        await Promise.all([
          fetchReviews(),
          fetchFavorites(),
          fetchBookings()
        ]);
      } catch (error) {
        console.error("Error fetching hotel details:", error);
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
    const existingFav = favorites.find(fav => fav.hotel_id === parseInt(id));
    try {
      if (existingFav) {
        await favoriteService.deleteFavorite(existingFav.id);
        setFavorites(prev => prev.filter(fav => fav.id !== existingFav.id));
      } else {
        const res = await favoriteService.addFavorite({ hotelId: parseInt(id) });
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
        hotelId: parseInt(id),
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
  if (!hotel) return <div className="text-center pt-20 text-muted-foreground">Hotel not found.</div>;

  const isFav = favorites.some(fav => fav.hotel_id === hotel.id);
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : Number(hotel.rating || 0).toFixed(1);

  const hotelRoomIds = rooms.map(r => r.id);
  const hasCompletedBooking = bookings.some(b => 
    hotelRoomIds.includes(b.room_id) && b.status === "completed"
  );
  const hasAlreadyReviewed = reviews.some(r => 
    user && r.username === user.username
  );
  const canReview = user && user.role === "tourist" && hasCompletedBooking && !hasAlreadyReviewed;

  const getHotelImage = (hotel) => {
    if (hotel.image_url) return hotel.image_url;
    if (hotel.image) return hotel.image;
    if (hotel.images && hotel.images[0]) return hotel.images[0];
    return "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&auto=format&fit=crop&q=80";
  };

  const imageUrl = getHotelImage(hotel);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{hotel.name}</h1>
          <div className="flex flex-wrap items-center text-muted-foreground gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span>{hotel.address || "Address not available"}</span>
            <span className="mx-2 hidden sm:inline">|</span>
            <span className="flex items-center text-amber-500 font-semibold">
              <Star className="w-5 h-5 mr-1 fill-current" />
              <span className="text-foreground">{avgRating === "0.0" ? "New" : avgRating}</span>
              <span className="text-muted-foreground text-sm font-normal ml-1">({reviews.length} reviews)</span>
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + " " + hotel.address)}`, '_blank')}
          >
            <MapPin className="w-4 h-4" />
            View on Map
          </Button>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Image */}
          <div className="h-[400px] rounded-2xl overflow-hidden bg-muted relative">
            <img 
              src={imageUrl} 
              alt={hotel.name} 
              className="w-full h-full object-cover" 
              loading="lazy"
            />
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">About this hotel</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {hotel.description || "Experience luxury and comfort in the heart of the city. This hotel offers premium amenities and excellent service."}
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="flex items-center text-muted-foreground"><Wifi className="w-5 h-5 mr-2" /> Free WiFi</div>
              <div className="flex items-center text-muted-foreground"><Coffee className="w-5 h-5 mr-2" /> Breakfast Included</div>
              <div className="flex items-center text-muted-foreground"><Car className="w-5 h-5 mr-2" /> Free Parking</div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="pt-6 border-t">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-primary" /> Guest Reviews
            </h2>

            {/* Review Form */}
            {user && user.role === "tourist" && (
              canReview ? (
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
              ) : (
                <Card className="mb-8 border-dashed bg-muted/20 p-6 text-center text-muted-foreground text-sm font-medium">
                  {hasAlreadyReviewed ? (
                    "You have already reviewed this hotel."
                  ) : (
                    "You can only rate and review hotels you have stayed at."
                  )}
                </Card>
              )
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
                          <p className="font-semibold text-sm">{rev.username || "Guest User"}</p>
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
          <h2 className="text-2xl font-semibold mb-4">Available Rooms</h2>
          {rooms.length === 0 ? (
            <p className="text-muted-foreground">No rooms available at this moment.</p>
          ) : (
            <div className="space-y-4">
              {rooms.map(room => (
                <Card key={room.id} className="shadow-sm border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{room.room_type}</h3>
                        <p className="text-sm text-muted-foreground">Capacity: {room.capacity} persons</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          ${room.price_per_night} <span className="text-sm font-normal text-muted-foreground">/ night</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      {room.is_available ? (
                        <Link to={`/book/${hotel.id}/${room.id}`}>
                          <Button size="md" className="w-full font-semibold">Select Room</Button>
                        </Link>
                      ) : (
                        <Button size="md" className="w-full font-semibold" disabled>Currently Unavailable</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Location Map Card */}
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Location Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[220px] rounded-lg overflow-hidden border">
                <iframe
                  title="Google Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(hotel.name + " " + hotel.address)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  allowFullScreen
                  className="rounded-md"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
