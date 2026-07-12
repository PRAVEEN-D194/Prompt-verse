import api from "./api";

export const aiService = {
  generateItinerary: async (data) => {
    const response = await api.post("/ai/generate-itinerary", data);
    return response.data;
  }
};
