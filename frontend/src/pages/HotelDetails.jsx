import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { hotelService } from "../services/hotelService";
import { roomService } from "../services/roomService";
import { Loader } from "../components/ui/Loader";
import { Button } from "../components/ui/Button";
import { MapPin, Star, Wifi, Coffee, Car, Users, Check } from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import axios from "axios";

export const HotelDetails = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotelAndRooms = async () => {
      console.log(id);
      try {
        const [hotelRes, roomsRes] = await Promise.all([
          hotelService.getHotelById(id),
          roomService.getRoomsByHotel(id)
        ]);
        setHotel(hotelRes.data.hotel);
        setRooms(roomsRes.data.rooms || []);
      } catch (error) {
        console.error("Error fetching hotel details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHotelAndRooms();
  }, [id]);

  if (loading) return <div className="h-full pt-20"><Loader /></div>;
  if (!hotel) return <div className="text-center pt-20 text-muted-foreground">Hotel not found.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{hotel.name}</h1>
        <div className="flex items-center text-muted-foreground mb-4">
          <MapPin className="w-5 h-5 mr-1 text-primary" />
          <span>{hotel.address || "Address not available"}</span>
          <div className="mx-4 h-4 w-px bg-border"></div>
          <span className="flex items-center text-accent">
            <Star className="w-5 h-5 mr-1 fill-current" />
            <span className="font-semibold text-foreground">{hotel.rating || "4.5"}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Main Image */}
          <div className="h-[400px] rounded-2xl overflow-hidden bg-muted">
            {hotel.images && hotel.images[0] ? (
              <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                <span className="text-primary font-medium">No Image Available</span>
              </div>
            )}
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
              {hotel.amenities?.map((amenity, idx) => (
                <div key={idx} className="flex items-center text-muted-foreground">
                  <Check className="w-5 h-5 mr-2 text-primary" />
                  {amenity}
                </div>
              )) || (
                  <>
                    <div className="flex items-center text-muted-foreground"><Wifi className="w-5 h-5 mr-2" /> Free WiFi</div>
                    <div className="flex items-center text-muted-foreground"><Coffee className="w-5 h-5 mr-2" /> Breakfast</div>
                    <div className="flex items-center text-muted-foreground"><Car className="w-5 h-5 mr-2" /> Parking</div>
                  </>
                )}
            </div>
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
        </div>
      </div>
    </div>
  );
};
