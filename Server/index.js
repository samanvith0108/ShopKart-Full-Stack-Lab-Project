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

const app = express();

dotenv.config();
const PORT = process.env.PORT || 8000;

app.get("/health", (_req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({
    status: databaseReady ? "ok" : "database unavailable",
  });
});

mongoose
  .connect(process.env.dbURL)
  .then(() => {
    console.log("Database Connected");
  })
  .catch((error) => {
    console.log(error);
  });

const configuredOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const developmentOrigins =
  process.env.NODE_ENV === "production"
    ? []
    : ["http://localhost:5173", "http://127.0.0.1:5173"];

app.use(
  cors({
    origin: [...new Set([...developmentOrigins, ...configuredOrigins])],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use("/customers", userRoutes);
app.use("/products", productRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

app.listen(PORT, () => {
  console.log(`Server Started at ${PORT}`);
});
