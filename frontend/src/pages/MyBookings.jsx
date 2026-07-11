import React, { useState, useEffect } from "react";
import { bookingService } from "../services/bookingService";
import { Card, CardContent } from "../components/ui/Card";
import { Loader } from "../components/ui/Loader";
import { Calendar, MapPin, CreditCard } from "lucide-react";
import { Button } from "../components/ui/Button";

export const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await bookingService.getMyBookings();
        setBookings(res.data.bookings);
      } catch (error) {
        console.error("Error fetching bookings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) return <Loader />;

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
          {bookings.map((booking) => (
            <Card key={booking._id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-48 h-48 md:h-auto bg-muted">
                  {booking.hotel?.images?.[0] && (
                    <img src={booking.hotel.images[0]} alt={booking.hotel.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <CardContent className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold">{booking.hotel?.name || "Unknown Hotel"}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status?.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-muted-foreground flex items-center mb-4 text-sm">
                      <MapPin className="w-4 h-4 mr-1" /> {booking.hotel?.location?.city}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-primary" />
                        <span>
                          Check-in: {new Date(booking.checkInDate).toLocaleDateString()}<br/>
                          Check-out: {new Date(booking.checkOutDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CreditCard className="w-4 h-4 mr-2 text-primary" />
                        <span>Total: ${booking.totalPrice}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline">View Invoice</Button>
                    {booking.status !== 'cancelled' && <Button variant="danger">Cancel Booking</Button>}
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
