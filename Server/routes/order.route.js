import express from "express";
import {
  createPaymentOrder,
  getOrderById,
  getOrders,
  recordPaymentFailure,
  verifyPayment,
} from "../Controllers/order.controller.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(isAuthenticated);
router.post("/create-payment-order", createPaymentOrder);
router.post("/verify-payment", verifyPayment);
router.post("/payment-failed", recordPaymentFailure);
router.get("/", getOrders);
router.get("/:id", getOrderById);

export default router;
