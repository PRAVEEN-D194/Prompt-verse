import React, { useState, useEffect } from "react";
import { bookingService } from "../services/bookingService";
import { Card, CardContent } from "../components/ui/Card";
import { Loader } from "../components/ui/Loader";
import { Calendar, MapPin, CreditCard, Building } from "lucide-react";
import { Button } from "../components/ui/Button";

export const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await bookingService.getMyBookings();
      setBookings(res.data.bookings || []);
    } catch (error) {
      console.error("Error fetching bookings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await bookingService.cancelBooking(bookingId);
      await fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel booking.");
    }
  };

  if (loading) return <div className="pt-20"><Loader /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Bookings</h1>
      
      {bookings.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            You don't have any bookings yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => {
            const getImageUrl = () => {
              const nameLower = (booking.hotel_name || "").toLowerCase();
              const locLower = (booking.hotel_address || "").toLowerCase();
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
            };

            const imageUrl = getImageUrl();

            return (
              <Card key={booking.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-48 h-48 md:h-auto bg-muted relative flex-shrink-0">
                    <img 
                      src={imageUrl} 
                      alt={booking.hotel_name || "Hotel"} 
                      className="w-full h-full object-cover" 
                      loading="lazy"
                    />
                  </div>
                <CardContent className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold">{booking.hotel_name || "Hotel Reservation"}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground flex items-center mb-4 text-xs font-semibold uppercase tracking-wider">
                      Room type: {booking.room_type || "Standard"}
                    </p>
                    <p className="text-muted-foreground flex items-center mb-4 text-sm">
                      <MapPin className="w-4 h-4 mr-1 text-primary" /> {booking.hotel_address || "Hotel Location"}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-primary" />
                        <span>
                          Check-in: {new Date(booking.check_in_date).toLocaleDateString()}<br/>
                          Check-out: {new Date(booking.check_out_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CreditCard className="w-4 h-4 mr-2 text-primary" />
                        <span className="font-bold text-primary">${booking.total_price}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                      <Button variant="danger" onClick={() => handleCancelBooking(booking.id)}>
                        Cancel Booking
                      </Button>
                    )}
                  </div>
                </CardContent>
              </div>
            </Card>
          );
        })}
      </div>
    )}
    </div>
  );
};
