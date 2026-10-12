import { axiosInstance } from "../axiosCalls/axios";

export const getWishlist = (signal) =>
  axiosInstance.get("/wishlist", { signal });

export const addToWishlist = (productId) =>
  axiosInstance.post(`/wishlist/${productId}`);

export const removeFromWishlist = (productId) =>
  axiosInstance.delete(`/wishlist/${productId}`);
