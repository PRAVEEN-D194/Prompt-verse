import api from "./api";

export const reviewService = {
  getReviews: async (params) => {
    // params can include hotelId or touristPlaceId
    const response = await api.get("/reviews", { params });
    return response.data;
  },
  createReview: async (reviewData) => {
    const response = await api.post("/reviews", reviewData);
    return response.data;
  },
  deleteReview: async (id) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  }
};
