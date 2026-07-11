import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { hotelService } from "../services/hotelService";
import { bookingService } from "../services/bookingService";
import { roomService } from "../services/roomService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Loader } from "../components/ui/Loader";
import { CheckCircle } from "lucide-react";

export const Booking = () => {
  const { hotelId, roomId } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    checkInDate: "",
    checkOutDate: "",
    numberOfRooms: 1,
    specialRequests: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hotelRes, roomsRes] = await Promise.all([
          hotelService.getHotelById(hotelId),
          roomService.getRoomsByHotel(hotelId)
        ]);
        setHotel(hotelRes.data.hotel);
        const selectedRoom = (roomsRes.data.rooms || []).find(r => r.id === parseInt(roomId));
        setRoom(selectedRoom);
      } catch (error) {
        console.error("Error fetching details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hotelId, roomId]);

  const calculateTotal = () => {
    if (!formData.checkInDate || !formData.checkOutDate || !room) return 0;
    const start = new Date(formData.checkInDate);
    const end = new Date(formData.checkOutDate);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (nights <= 0) return 0;
    return nights * room.price_per_night;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        roomId: parseInt(roomId),
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
      };
      console.log(payload);
      await bookingService.createBooking(payload);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard/bookings'), 3000);
    } catch (error) {
      console.error("Booking failed", error);
      alert("Booking failed. Please check the dates and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="pt-20"><Loader /></div>;
  if (!hotel) return <div className="text-center pt-20">Hotel not found.</div>;
  if (!room) return <div className="text-center pt-20">Room not found.</div>;

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full text-center p-8 border-green-200 bg-green-50/50">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-green-900 mb-2">Booking Confirmed!</h2>
          <p className="text-green-700 mb-6">Your reservation at {hotel.name} was successful.</p>
          <p className="text-sm text-green-600">Redirecting to your bookings...</p>
        </Card>
      </div>
    );
  }

  const total = calculateTotal();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Complete Your Booking</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
              <CardDescription>Enter your stay dates and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Check-in Date"
                  type="date"
                  required
                  value={formData.checkInDate}
                  onChange={e => setFormData({ ...formData, checkInDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
                <Input
                  label="Check-out Date"
                  type="date"
                  required
                  value={formData.checkOutDate}
                  onChange={e => setFormData({ ...formData, checkOutDate: e.target.value })}
                  min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                />


                <div className="pt-4">
                  <Button type="submit" size="lg" className="w-full" disabled={submitting || total <= 0}>
                    {submitting ? "Processing..." : "Confirm Booking"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-muted/30">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">Summary</h3>
              <div className="flex gap-4 mb-6">
                <img src={hotel.images?.[0] || 'https://via.placeholder.com/100'} alt={hotel.name} className="w-24 h-24 object-cover rounded-md" />
                <div>
                  <h4 className="font-semibold">{hotel.name}</h4>
                  <p className="text-sm text-muted-foreground">{hotel.location?.city}</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Room Type</span>
                  <span>{room.room_type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Price per night</span>
                  <span>${room.price_per_night}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-3 border-t">
                  <span>Total</span>
                  <span className="text-primary">${total}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
