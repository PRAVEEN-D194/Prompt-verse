import api from "./api";

export const placeService = {
  getAllPlaces: async (params) => {
    const response = await api.get("/places", { params });
    return response.data;
  },
  getPlaceById: async (id) => {
    const response = await api.get(`/places/${id}`);
    return response.data;
  },
  createPlace: async (placeData) => {
    const response = await api.post("/places", placeData);
    return response.data;
  },
  updatePlace: async (id, placeData) => {
    const response = await api.put(`/places/${id}`, placeData);
    return response.data;
  },
  deletePlace: async (id) => {
    const response = await api.delete(`/places/${id}`);
    return response.data;
  },
};
