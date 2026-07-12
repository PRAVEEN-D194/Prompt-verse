import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { 
  Map, 
  Calendar, 
  Heart, 
  Compass, 
  Mail, 
  Trash2, 
  Bell, 
  Clock, 
  MapPin, 
  CheckCircle, 
  X, 
  Check 
} from "lucide-react";
import { Link } from "react-router-dom";
import { authService } from "../services/authService";
import { bookingService } from "../services/bookingService";
import { favoriteService } from "../services/favoriteService";
import { itineraryService } from "../services/itineraryService";
import { notificationService } from "../services/notificationService";
import { Loader } from "../components/ui/Loader";
import { Button } from "../components/ui/Button";

export const TouristDashboard = () => {
  const { user } = useContext(AuthContext);
  
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [itineraries, setItineraries] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboardData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [profileRes, bookingsRes, favoritesRes, itinerariesRes, notificationsRes] = await Promise.all([
        authService.getProfile(),
        bookingService.getMyBookings(),
        favoriteService.getFavorites(),
        itineraryService.getMyItineraries(),
        notificationService.getNotifications()
      ]);

      setProfile(profileRes.data.user);
      setBookings(bookingsRes.data.bookings || []);
      setFavorites(favoritesRes.data.favorites || []);
      setItineraries(itinerariesRes.data.itineraries || []);
      setNotifications(notificationsRes.data.notifications || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching tourist dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh interval (every 10 seconds)
    const interval = setInterval(() => {
      fetchDashboardData(false);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setActionLoading(true);
    try {
      await bookingService.cancelBooking(bookingId);
      await fetchDashboardData(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel booking.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId) => {
    setActionLoading(true);
    try {
      await favoriteService.deleteFavorite(favoriteId);
      await fetchDashboardData(false);
    } catch (err) {
      alert("Failed to remove from favorites.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      await fetchDashboardData(false);
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      await fetchDashboardData(false);
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/10 text-destructive p-6 my-6 text-center">
        <p className="font-semibold">{error}</p>
        <Button onClick={() => fetchDashboardData()} className="mt-4">Retry</Button>
      </Card>
    );
  }

  // Filter bookings into upcoming and history
  const today = new Date().setHours(0, 0, 0, 0);
  const upcomingBookings = bookings.filter(b => b.status !== "cancelled" && new Date(b.check_in_date || b.checkInDate) >= today);
  const bookingHistory = bookings.filter(b => b.status === "cancelled" || new Date(b.check_in_date || b.checkInDate) < today);

  const stats = [
    { label: "Upcoming Trips", value: upcomingBookings.length.toString(), icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10", link: "/dashboard/bookings" },
    { label: "Saved Places", value: favorites.length.toString(), icon: Heart, color: "text-red-500", bg: "bg-red-500/10", link: "/dashboard/favorites" },
    { label: "AI Plans", value: itineraries.length.toString(), icon: Compass, color: "text-purple-500", bg: "bg-purple-500/10", link: "/planner" },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl uppercase">
              {(profile?.username || user?.name || "T").charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">Welcome back, {profile?.username || user?.name}!</h2>
              <p className="text-muted-foreground flex items-center gap-1.5 text-sm mt-1">
                <Mail size={14} /> {profile?.email || user?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-primary/15 text-primary rounded-full text-xs font-semibold uppercase tracking-wider">
              {profile?.role || user?.role || "Tourist"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link key={idx} to={stat.link}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium mb-1">{stat.label}</p>
                    <h3 className="text-3xl font-bold">{stat.value}</h3>
                  </div>
                  <div className={`h-12 w-12 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center`}>
                    <Icon size={24} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Bookings & Itineraries */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center text-lg">
                <span>Upcoming Trips</span>
                <Link to="/dashboard/bookings" className="text-xs text-primary hover:underline">View All</Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingBookings.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No upcoming bookings. Let's plan a new adventure!
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <div key={booking.id} className="flex justify-between items-start border-b pb-4 last:border-0 last:pb-0">
                      <div>
                        <h4 className="font-semibold text-sm">{booking.hotel_name || "Hotel Stay"}</h4>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                          <MapPin size={12} className="mr-1" /> {booking.hotel_address || "Hotel Location"}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center mt-0.5">
                          <Calendar size={12} className="mr-1" /> 
                          {new Date(booking.check_in_date || booking.checkInDate).toLocaleDateString()} - {new Date(booking.check_out_date || booking.checkOutDate).toLocaleDateString()}
                        </p>
                        <span className="text-xs font-semibold text-primary block mt-1">${booking.total_price || booking.totalPrice}</span>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                          booking.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {booking.status}
                        </span>
                        <Button 
                          variant="danger" 
                          size="sm" 
                          disabled={actionLoading}
                          onClick={() => handleCancelBooking(booking.id)}
                          className="h-7 text-xs px-2"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Itineraries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center text-lg">
                <span>AI Itineraries</span>
                <Link to="/planner" className="text-xs text-primary hover:underline font-medium">Create New</Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {itineraries.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No AI itineraries generated yet. Try our AI Trip Planner!
                </div>
              ) : (
                <div className="space-y-4">
                  {itineraries.slice(0, 3).map((itinerary) => (
                    <div key={itinerary.id} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-sm text-primary">{itinerary.title}</h4>
                        {itinerary.start_date && (
                          <span className="text-[10px] text-muted-foreground flex items-center">
                            <Clock size={10} className="mr-1" />
                            {new Date(itinerary.start_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{itinerary.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trip History</CardTitle>
            </CardHeader>
            <CardContent>
              {bookingHistory.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No completed or cancelled bookings in history.
                </div>
              ) : (
                <div className="space-y-4">
                  {bookingHistory.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">{booking.hotel_name || "Hotel Stay"}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(booking.check_in_date || booking.checkInDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                          booking.status === "cancelled" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {booking.status}
                        </span>
                        <span className="block text-xs font-semibold mt-1 text-muted-foreground">${booking.total_price || booking.totalPrice}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: Favorites & Notifications */}
        <div className="space-y-6">
          {/* Favorites */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center text-lg">
                <span>Favorite Places</span>
                <Link to="/dashboard/favorites" className="text-xs text-primary hover:underline">View All</Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {favorites.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No favorites added yet. Explore and save places you love!
                </div>
              ) : (
                <div className="space-y-4">
                  {favorites.slice(0, 5).map((fav) => {
                    const isHotel = !!fav.hotel_id;
                    const id = isHotel ? fav.hotel_id : fav.place_id;
                    const name = isHotel ? fav.hotel_name : fav.place_name;
                    const address = isHotel ? fav.hotel_address : fav.place_location;
                    
                    return (
                      <div key={fav.id} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-semibold text-sm truncate">{name}</h4>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-medium uppercase ${
                              isHotel ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"
                            }`}>
                              {isHotel ? "Hotel" : "Place"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate flex items-center mt-0.5">
                            <MapPin size={10} className="mr-0.5 flex-shrink-0" /> {address}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {isHotel && (
                            <Link to={`/hotels/${id}`}>
                              <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-0">View</Button>
                            </Link>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            disabled={actionLoading}
                            onClick={() => handleRemoveFavorite(fav.id)}
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center text-lg">
                <span>Recent Notifications</span>
                <Link to="/dashboard/notifications" className="text-xs text-primary hover:underline">View All</Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No notifications.
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.slice(0, 5).map((noti) => (
                    <div key={noti.id} className={`border-b pb-3 last:border-0 last:pb-0 ${noti.is_read ? "opacity-60" : ""}`}>
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-xs flex items-center gap-1">
                          {!noti.is_read && <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></span>}
                          {noti.title}
                        </h4>
                        <div className="flex gap-1">
                          {!noti.is_read && (
                            <button 
                              onClick={() => handleMarkAsRead(noti.id)}
                              className="text-[10px] text-primary hover:underline flex items-center"
                              title="Mark as Read"
                            >
                              <Check size={10} className="mr-0.5" /> Read
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteNotification(noti.id)}
                            className="text-[10px] text-red-500 hover:underline flex items-center"
                            title="Delete"
                          >
                            <X size={10} className="mr-0.5" /> Del
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{noti.message}</p>
                      <span className="text-[9px] text-muted-foreground mt-1 block">
                        {new Date(noti.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

