import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { 
  Building, 
  CalendarCheck, 
  DollarSign, 
  TrendingUp, 
  Star, 
  Mail, 
  MapPin, 
  Clock, 
  Calendar,
  Check,
  X,
  Plus
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { authService } from "../services/authService";
import { hotelService } from "../services/hotelService";
import { roomService } from "../services/roomService";
import { bookingService } from "../services/bookingService";
import { reviewService } from "../services/reviewService";
import { Loader } from "../components/ui/Loader";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export const HotelOwnerDashboard = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const isHotelsPath = location.pathname === "/dashboard/my-hotels";
  const isBookingsPath = location.pathname === "/dashboard/hotel-bookings";
  const isOverviewPath = !isHotelsPath && !isBookingsPath;

  const [profile, setProfile] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Forms state
  const [showAddHotel, setShowAddHotel] = useState(false);
  const [hotelForm, setHotelForm] = useState({
    name: "",
    description: "",
    address: "",
    contactNumber: ""
  });

  const [showAddRoom, setShowAddRoom] = useState(false);
  const [roomForm, setRoomForm] = useState({
    hotelId: "",
    roomType: "Standard",
    pricePerNight: "",
    capacity: "",
    isAvailable: true
  });

  const fetchDashboardData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      // 1. Fetch profile and all hotels
      const [profileRes, hotelsRes] = await Promise.all([
        authService.getProfile(),
        hotelService.getAllHotels()
      ]);

      const currentProfile = profileRes.data.user;
      setProfile(currentProfile);

      const currentUserId = currentProfile?.id || user?._id || user?.id;

      // 2. Filter hotels belonging to this owner
      const myHotels = (hotelsRes.data || []).filter(
        h => h.owner_id?.toString() === currentUserId?.toString()
      );
      setHotels(myHotels);

      if (myHotels.length > 0) {
        // 3. Fetch rooms, bookings, and reviews in parallel for owned hotels
        const roomsPromises = myHotels.map(h => roomService.getRoomsByHotel(h.id));
        const bookingsPromises = myHotels.map(h => bookingService.getHotelBookings(h.id));
        const reviewsPromises = myHotels.map(h => reviewService.getReviews({ hotelId: h.id }));

        const [roomsResults, bookingsResults, reviewsResults] = await Promise.all([
          Promise.all(roomsPromises),
          Promise.all(bookingsPromises),
          Promise.all(reviewsPromises)
        ]);

        // Aggregate rooms
        const allRooms = roomsResults.flatMap((res, idx) => {
          const hotel = myHotels[idx];
          return (res.data.rooms || []).map(r => ({ ...r, hotelName: hotel.name }));
        });
        setRooms(allRooms);

        // Aggregate bookings
        const allBookings = bookingsResults.flatMap((res, idx) => {
          const hotel = myHotels[idx];
          return (res.data.bookings || []).map(b => ({ 
            ...b, 
            hotelName: hotel.name, 
            hotelId: hotel.id 
          }));
        });
        setBookings(allBookings);

        // Aggregate reviews
        const allReviews = reviewsResults.flatMap((res, idx) => {
          const hotel = myHotels[idx];
          return (res.data.reviews || []).map(r => ({ ...r, hotelName: hotel.name }));
        });
        setReviews(allReviews);
      } else {
        setRooms([]);
        setBookings([]);
        setReviews([]);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching hotel owner dashboard data:", err);
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

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setActionLoading(true);
    try {
      await bookingService.updateBookingStatus(bookingId, newStatus);
      await fetchDashboardData(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update booking status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddHotelSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await hotelService.createHotel(hotelForm);
      setHotelForm({ name: "", description: "", address: "", contactNumber: "" });
      setShowAddHotel(false);
      await fetchDashboardData(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add hotel.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddRoomSubmit = async (e) => {
    e.preventDefault();
    if (!roomForm.hotelId) {
      alert("Please select a hotel.");
      return;
    }
    setActionLoading(true);
    try {
      await roomService.createRoom({
        hotelId: parseInt(roomForm.hotelId),
        roomType: roomForm.roomType,
        pricePerNight: parseFloat(roomForm.pricePerNight),
        capacity: parseInt(roomForm.capacity),
        isAvailable: roomForm.isAvailable
      });
      setRoomForm({ hotelId: "", roomType: "Standard", pricePerNight: "", capacity: "", isAvailable: true });
      setShowAddRoom(false);
      await fetchDashboardData(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add room.");
    } finally {
      setActionLoading(false);
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

  // Calculate statistics
  const today = new Date().setHours(0, 0, 0, 0);
  const activeBookings = bookings.filter(
    b => b.status !== "cancelled" && new Date(b.check_in_date) <= today && new Date(b.check_out_date) >= today
  );
  const bookedRoomsCount = activeBookings.length;
  const availableRoomsCount = Math.max(0, rooms.length - bookedRoomsCount);
  
  const pendingCount = bookings.filter(b => b.status === "pending").length;
  const confirmedCount = bookings.filter(b => b.status === "confirmed").length;
  const cancelledCount = bookings.filter(b => b.status === "cancelled").length;
  const completedCount = bookings.filter(b => b.status === "completed").length;

  const stats = [
    { label: "Total Hotels", value: hotels.length.toString(), icon: Building, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Total Rooms", value: rooms.length.toString(), icon: Building, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "Available Rooms", value: availableRoomsCount.toString(), icon: Check, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Booked Rooms", value: bookedRoomsCount.toString(), icon: X, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Total Bookings", value: bookings.length.toString(), icon: CalendarCheck, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Pending Bookings", value: pendingCount.toString(), icon: Clock, color: "text-yellow-600", bg: "bg-yellow-500/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl uppercase">
              {(profile?.username || user?.name || "O").charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">Welcome back, {profile?.username || user?.name}!</h2>
              <p className="text-muted-foreground flex items-center gap-1.5 text-sm mt-1">
                <Mail size={14} /> {profile?.email || user?.email}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 bg-primary/15 text-primary rounded-full text-xs font-semibold uppercase tracking-wider">
              {profile?.role || user?.role || "Hotel Owner"}
            </span>
            <Link to="/dashboard/my-hotels">
              <Button size="sm" className="h-9 px-3 text-xs gap-1">
                <Building size={14} /> Manage Hotels
              </Button>
            </Link>
            <Link to="/dashboard/my-hotels">
              <Button size="sm" variant="outline" className="h-9 px-3 text-xs gap-1">
                <Plus size={14} /> Manage Rooms
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx}>
              <CardContent className="p-4 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-muted-foreground text-xs font-medium truncate">{stat.label}</p>
                  <div className={`h-8 w-8 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={16} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 1. OVERVIEW VIEW */}
      {isOverviewPath && (
        <>
          {/* Room Occupancy Detail Card */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">Room Availability Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">Total Rooms</p>
                  <h4 className="text-3xl font-bold text-primary">{rooms.length}</h4>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-green-800/80 text-xs font-semibold uppercase tracking-wider mb-1">Available Rooms</p>
                  <h4 className="text-3xl font-bold text-green-700">{availableRoomsCount}</h4>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-purple-800/80 text-xs font-semibold uppercase tracking-wider mb-1">Booked Today</p>
                  <h4 className="text-3xl font-bold text-purple-700">{bookedRoomsCount}</h4>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Bookings */}
            <Card>
              <CardHeader className="flex flex-row justify-between items-center pb-2">
                <CardTitle className="text-lg">Recent Bookings</CardTitle>
                <Link to="/dashboard/hotel-bookings" className="text-xs text-primary hover:underline font-semibold">View All</Link>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No recent bookings to display.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex justify-between items-start border-b pb-4 last:border-0 last:pb-0">
                        <div>
                          <h4 className="font-semibold text-sm">{booking.hotelName}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Room: {booking.room_type} | Guest: {booking.tourist_name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center">
                            <Calendar size={12} className="mr-1" />
                            {new Date(booking.check_in_date).toLocaleDateString()} - {new Date(booking.check_out_date).toLocaleDateString()}
                          </p>
                          <span className="text-xs font-semibold text-primary block mt-1">${booking.total_price}</span>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                            booking.status === "confirmed" ? "bg-green-100 text-green-800" :
                            booking.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                            booking.status === "completed" ? "bg-blue-100 text-blue-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {booking.status}
                          </span>
                          <div className="flex gap-1.5">
                            {booking.status === "pending" && (
                              <>
                                <Button 
                                  variant="primary" 
                                  size="sm" 
                                  disabled={actionLoading}
                                  onClick={() => handleUpdateStatus(booking.id, "confirmed")}
                                  className="h-7 text-xs px-2"
                                >
                                  Confirm
                                </Button>
                                <Button 
                                  variant="danger" 
                                  size="sm" 
                                  disabled={actionLoading}
                                  onClick={() => handleUpdateStatus(booking.id, "cancelled")}
                                  className="h-7 text-xs px-2"
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {booking.status === "confirmed" && (
                              <>
                                <Button 
                                  variant="secondary" 
                                  size="sm" 
                                  disabled={actionLoading}
                                  onClick={() => handleUpdateStatus(booking.id, "completed")}
                                  className="h-7 text-xs px-2"
                                >
                                  Complete
                                </Button>
                                <Button 
                                  variant="danger" 
                                  size="sm" 
                                  disabled={actionLoading}
                                  onClick={() => handleUpdateStatus(booking.id, "cancelled")}
                                  className="h-7 text-xs px-2"
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Overview & Statistics */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Booking Statistics Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm border-b pb-2">
                      <span className="text-muted-foreground">Total Bookings</span>
                      <span className="font-semibold">{bookings.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b pb-2">
                      <span className="text-yellow-600 font-medium">Pending Bookings</span>
                      <span className="font-semibold text-yellow-600">{pendingCount}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b pb-2">
                      <span className="text-green-600 font-medium">Confirmed Bookings</span>
                      <span className="font-semibold text-green-600">{confirmedCount}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b pb-2">
                      <span className="text-blue-600 font-medium">Completed Bookings</span>
                      <span className="font-semibold text-blue-600">{completedCount}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-red-600 font-medium">Cancelled Bookings</span>
                      <span className="font-semibold text-red-600">{cancelledCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Reviews */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  {reviews.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No recent reviews to display.
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
                      {reviews.slice(0, 3).map((review) => (
                        <div key={review.id} className="border-b pb-3 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-xs text-primary">{review.hotelName}</h4>
                              <p className="text-[10px] text-muted-foreground">Guest: {review.username}</p>
                            </div>
                            <span className="flex items-center text-xs text-amber-500">
                              <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                              {review.rating}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 italic">"{review.comment}"</p>
                          <span className="text-[9px] text-muted-foreground mt-1 block">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* 2. HOTELS & ROOMS VIEW */}
      {isHotelsPath && (
        <div className="space-y-6">
          <div className="flex gap-4">
            <Button size="sm" onClick={() => { setShowAddHotel(!showAddHotel); setShowAddRoom(false); }} className="gap-1">
              <Plus size={14} /> Add Hotel
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setShowAddRoom(!showAddRoom); setShowAddHotel(false); }} className="gap-1">
              <Plus size={14} /> Add Room
            </Button>
          </div>

          {/* Forms Section */}
          {(showAddHotel || showAddRoom) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {showAddHotel && (
                <Card className="border-primary/20">
                  <CardHeader className="flex justify-between flex-row items-center pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary">Add New Hotel</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setShowAddHotel(false)} className="h-6 w-6 p-0"><X size={14} /></Button>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <form onSubmit={handleAddHotelSubmit} className="space-y-4">
                      <Input 
                        label="Hotel Name" 
                        placeholder="Enter hotel name" 
                        value={hotelForm.name} 
                        onChange={e => setHotelForm({...hotelForm, name: e.target.value})} 
                        required 
                      />
                      <Input 
                        label="Address" 
                        placeholder="Enter hotel address" 
                        value={hotelForm.address} 
                        onChange={e => setHotelForm({...hotelForm, address: e.target.value})} 
                        required 
                      />
                      <Input 
                        label="Contact Number" 
                        placeholder="Enter contact number" 
                        value={hotelForm.contactNumber} 
                        onChange={e => setHotelForm({...hotelForm, contactNumber: e.target.value})} 
                      />
                      <div>
                        <label className="block text-sm font-medium mb-1 text-foreground">Description</label>
                        <textarea 
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                          placeholder="Enter hotel description" 
                          value={hotelForm.description} 
                          onChange={e => setHotelForm({...hotelForm, description: e.target.value})}
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={actionLoading}>
                        {actionLoading ? "Creating..." : "Create Hotel"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {showAddRoom && (
                <Card className="border-primary/20">
                  <CardHeader className="flex justify-between flex-row items-center pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary">Add New Room</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setShowAddRoom(false)} className="h-6 w-6 p-0"><X size={14} /></Button>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <form onSubmit={handleAddRoomSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-foreground">Select Hotel</label>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                          value={roomForm.hotelId} 
                          onChange={e => setRoomForm({...roomForm, hotelId: e.target.value})}
                          required
                        >
                          <option value="">-- Choose Hotel --</option>
                          {hotels.map(h => (
                            <option key={h.id} value={h.id}>{h.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-foreground">Room Type</label>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                          value={roomForm.roomType} 
                          onChange={e => setRoomForm({...roomForm, roomType: e.target.value})}
                        >
                          <option value="Standard">Standard</option>
                          <option value="Deluxe">Deluxe</option>
                          <option value="Suite">Suite</option>
                          <option value="Family">Family</option>
                        </select>
                      </div>
                      <Input 
                        label="Price Per Night ($)" 
                        type="number" 
                        placeholder="e.g. 150" 
                        value={roomForm.pricePerNight} 
                        onChange={e => setRoomForm({...roomForm, pricePerNight: e.target.value})} 
                        required 
                      />
                      <Input 
                        label="Capacity (Max Guests)" 
                        type="number" 
                        placeholder="e.g. 2" 
                        value={roomForm.capacity} 
                        onChange={e => setRoomForm({...roomForm, capacity: e.target.value})} 
                        required 
                      />
                      <div className="flex items-center space-x-2 py-2">
                        <input 
                          type="checkbox" 
                          id="roomAvailable"
                          checked={roomForm.isAvailable} 
                          onChange={e => setRoomForm({...roomForm, isAvailable: e.target.checked})}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="roomAvailable" className="text-sm font-medium text-foreground">Available for immediate booking</label>
                      </div>
                      <Button type="submit" className="w-full" disabled={actionLoading}>
                        {actionLoading ? "Adding..." : "Add Room"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Hotels List */}
          <div className="grid grid-cols-1 gap-6">
            {hotels.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground text-sm">
                  You haven't registered any hotels yet. Click "Add Hotel" to get started.
                </CardContent>
              </Card>
            ) : (
              hotels.map((hotel) => {
                const hotelRooms = rooms.filter(r => r.hotel_id === hotel.id);
                return (
                  <Card key={hotel.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/10 border-b pb-4">
                      <CardTitle className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
                            <Building size={20} /> {hotel.name}
                          </h3>
                          <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <MapPin size={12} className="mr-1" /> {hotel.address}
                          </p>
                          {hotel.contact_number && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Contact: {hotel.contact_number}
                            </p>
                          )}
                        </div>
                        <span className="flex items-center text-sm font-semibold text-amber-500 bg-amber-500/10 px-2 py-1 rounded">
                          <Star className="w-3.5 h-3.5 fill-current mr-1" />
                          {hotel.rating || "New"}
                        </span>
                      </CardTitle>
                      {hotel.description && (
                        <p className="text-xs text-muted-foreground mt-2 italic">{hotel.description}</p>
                      )}
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h4 className="font-semibold text-sm text-foreground uppercase tracking-wider">Rooms in this Hotel</h4>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8 text-xs gap-1"
                          onClick={() => {
                            setRoomForm(prev => ({ ...prev, hotelId: hotel.id.toString() }));
                            setShowAddRoom(true);
                            setShowAddHotel(false);
                          }}
                        >
                          <Plus size={12} /> Add Room
                        </Button>
                      </div>
                      
                      {hotelRooms.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">No rooms added to this hotel yet. Click "Add Room" to create one.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {hotelRooms.map((room) => (
                            <div key={room.id} className="border rounded-lg p-4 bg-card hover:shadow-sm transition-shadow">
                              <div className="flex justify-between items-start">
                                <h5 className="font-bold text-sm text-primary">{room.room_type}</h5>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                  room.is_available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }`}>
                                  {room.is_available ? "Available" : "Maintenance"}
                                </span>
                              </div>
                              <div className="space-y-1.5 mt-3 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Price per night:</span>
                                  <span className="font-semibold text-primary">${room.price_per_night}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Capacity:</span>
                                  <span className="font-semibold">{room.capacity} guest{room.capacity > 1 ? "s" : ""}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 3. BOOKINGS VIEW */}
      {isBookingsPath && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All Hotel Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No bookings received for your hotels yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="py-3 px-4">Guest</th>
                      <th className="py-3 px-4">Hotel</th>
                      <th className="py-3 px-4">Room Type</th>
                      <th className="py-3 px-4 text-center">Dates</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Total Amount</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-b hover:bg-muted/10 text-xs">
                        <td className="py-3 px-4 font-semibold">{booking.tourist_name || "Guest"}</td>
                        <td className="py-3 px-4">{booking.hotelName}</td>
                        <td className="py-3 px-4">{booking.room_type}</td>
                        <td className="py-3 px-4 text-center">
                          <div>{new Date(booking.check_in_date).toLocaleDateString()}</div>
                          <div className="text-[10px] text-muted-foreground">to {new Date(booking.check_out_date).toLocaleDateString()}</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                            booking.status === "confirmed" ? "bg-green-100 text-green-800" :
                            booking.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                            booking.status === "completed" ? "bg-blue-100 text-blue-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-primary">${booking.total_price}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-1.5">
                            {booking.status === "pending" && (
                              <>
                                <Button 
                                  variant="primary" 
                                  size="sm" 
                                  disabled={actionLoading}
                                  onClick={() => handleUpdateStatus(booking.id, "confirmed")}
                                  className="h-7 text-[10px] px-2 py-0.5"
                                >
                                  Confirm
                                </Button>
                                <Button 
                                  variant="danger" 
                                  size="sm" 
                                  disabled={actionLoading}
                                  onClick={() => handleUpdateStatus(booking.id, "cancelled")}
                                  className="h-7 text-[10px] px-2 py-0.5"
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {booking.status === "confirmed" && (
                              <>
                                <Button 
                                  variant="secondary" 
                                  size="sm" 
                                  disabled={actionLoading}
                                  onClick={() => handleUpdateStatus(booking.id, "completed")}
                                  className="h-7 text-[10px] px-2 py-0.5"
                                >
                                  Complete
                                </Button>
                                <Button 
                                  variant="danger" 
                                  size="sm" 
                                  disabled={actionLoading}
                                  onClick={() => handleUpdateStatus(booking.id, "cancelled")}
                                  className="h-7 text-[10px] px-2 py-0.5"
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                            {(booking.status === "completed" || booking.status === "cancelled") && (
                              <span className="text-muted-foreground text-[10px]">None</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};


