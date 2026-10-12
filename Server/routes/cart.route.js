import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCartQuantity,
} from "../Controllers/cart.controller.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(isAuthenticated);
router.get("/", getCart);
router.post("/:productId", addToCart);
router.patch("/:productId", updateCartQuantity);
router.delete("/:productId", removeFromCart);

export default router;
