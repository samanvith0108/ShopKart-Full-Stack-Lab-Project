import { axiosInstance } from "../axiosCalls/axios";

export const createPaymentOrder = (shippingAddress) =>
  axiosInstance.post("/orders/create-payment-order", { shippingAddress });

export const verifyPayment = (paymentDetails) =>
  axiosInstance.post("/orders/verify-payment", paymentDetails);

export const recordPaymentFailure = (paymentDetails) =>
  axiosInstance.post("/orders/payment-failed", paymentDetails);

export const getOrders = (signal) =>
  axiosInstance.get("/orders", { signal });

export const getOrderById = (id, signal) =>
  axiosInstance.get(`/orders/${id}`, { signal });
