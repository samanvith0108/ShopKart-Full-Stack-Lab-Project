import { axiosInstance } from "../axiosCalls/axios";

export const getCart = (signal) =>
  axiosInstance.get("/cart", { signal });

export const addProductToCart = (productId) =>
  axiosInstance.post(`/cart/${productId}`);

export const updateProductQuantity = (productId, quantity) =>
  axiosInstance.patch(`/cart/${productId}`, { quantity });

export const removeProductFromCart = (productId) =>
  axiosInstance.delete(`/cart/${productId}`);
