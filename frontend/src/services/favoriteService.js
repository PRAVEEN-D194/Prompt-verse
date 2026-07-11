import api from "./api";

export const favoriteService = {
  getFavorites: async () => {
    const response = await api.get("/favorites");
    return response.data;
  },
  addFavorite: async (favoriteData) => {
    const response = await api.post("/favorites", favoriteData);
    return response.data;
  },
  deleteFavorite: async (id) => {
    const response = await api.delete(`/favorites/${id}`);
    return response.data;
  }
};
