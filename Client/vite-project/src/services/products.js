import { axiosInstance } from "../axiosCalls/axios";

export const getProducts = ({ search = "", category = "All" } = {}, signal) => {
  const params = {};

  if (search.trim()) params.search = search.trim();
  if (category !== "All") params.category = category;

  return axiosInstance.get("/products", { params, signal });
};

export const getProductById = (id, signal) =>
  axiosInstance.get(`/products/${id}`, { signal });
