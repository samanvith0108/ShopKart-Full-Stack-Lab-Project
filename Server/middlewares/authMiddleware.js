import jwt from "jsonwebtoken";
import User from "../Models/user.model.js";

export const isAuthenticated = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    console.error("AUTHENTICATION ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to authenticate request" });
  }
};
