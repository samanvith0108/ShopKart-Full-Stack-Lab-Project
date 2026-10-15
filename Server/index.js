import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoutes from "./routes/user.route.js";
import productRoutes from "./routes/product.route.js";
import wishlistRoutes from "./routes/wishlist.route.js";
import cartRoutes from "./routes/cart.route.js";
import orderRoutes from "./routes/order.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 8000;

const frontendOrigins = (process.env.FRONTEND_URL ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? frontendOrigins
    : [...frontendOrigins, "http://localhost:5173", "http://127.0.0.1:5173"];

app.use(
  cors({
    origin(origin, callback) {
      callback(null, !origin || allowedOrigins.includes(origin));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});
app.use("/customers", userRoutes);
app.use("/products", productRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

const startServer = async () => {
  if (!process.env.dbURL) {
    throw new Error("dbURL must be configured before starting the server.");
  }
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be configured before starting the server.");
  }
  if (process.env.NODE_ENV === "production" && frontendOrigins.length === 0) {
    throw new Error("FRONTEND_URL must be configured in production.");
  }

  await mongoose.connect(process.env.dbURL);
  console.log("Database Connected");
  app.listen(PORT, () => {
    console.log(`Server Started at ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("SERVER STARTUP ERROR:", error);
  process.exitCode = 1;
});
