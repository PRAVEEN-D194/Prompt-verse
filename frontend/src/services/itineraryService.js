import api from "./api";

export const itineraryService = {
  getMyItineraries: async () => {
    const response = await api.get("/itineraries");
    return response.data;
  },
  createItinerary: async (itineraryData) => {
    const response = await api.post("/itineraries", itineraryData);
    return response.data;
  },
  updateItinerary: async (id, itineraryData) => {
    const response = await api.put(`/itineraries/${id}`, itineraryData);
    return response.data;
  },
  deleteItinerary: async (id) => {
    const response = await api.delete(`/itineraries/${id}`);
    return response.data;
  }
};
