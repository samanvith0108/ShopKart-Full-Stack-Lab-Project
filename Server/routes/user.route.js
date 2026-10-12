import express from "express";
import {
  getUser,
  loginUser,
  registerUser,
  logoutUser
} from "../Controllers/user.controller.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const userRoutes = express.Router();

userRoutes.post("/register", registerUser);

userRoutes.post("/login", loginUser);

userRoutes.get("/me", isAuthenticated, getUser);

userRoutes.post('/logout',logoutUser)

export default userRoutes;
