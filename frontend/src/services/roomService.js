import api from "./api";

export const roomService = {
  getRoomsByHotel: async (hotelId) => {
    const response = await api.get(`/rooms/hotel/${hotelId}`);
    return response.data;
  },
  createRoom: async (roomData) => {
    const response = await api.post("/rooms", roomData);
    return response.data;
  },
  updateRoom: async (id, roomData) => {
    const response = await api.put(`/rooms/${id}`, roomData);
    return response.data;
  },
  deleteRoom: async (id) => {
    const response = await api.delete(`/rooms/${id}`);
    return response.data;
  },
};
