import api from "./api";

export const bookingService = {
  getMyBookings: async () => {
    const response = await api.get("/bookings/my-bookings");
    return response.data;
  },
  createBooking: async (bookingData) => {
    const response = await api.post("/bookings", bookingData);
    return response.data;
  },
  getHotelBookings: async (hotelId) => {
    const response = await api.get(`/bookings/hotel-bookings/${hotelId}`); // Admin or Hotel owner
    return response.data;
  },
  updateBookingStatus: async (id, status) => {
    const response = await api.patch(`/bookings/${id}/status`, { status });
    return response.data;
  },
  cancelBooking: async (id) => {
    const response = await api.post(`/bookings/${id}/cancel`);
    return response.data;
  }
};
