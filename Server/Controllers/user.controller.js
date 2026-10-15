import User from "../Models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const getAuthCookieOptions = () => ({
  httpOnly: true,
  path: "/",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
});

const findUserByEmail = (email) =>
  User.findOne({
    email: { $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
  });

export const registerUser = async (req, res) => {
  try {
    const { fullname, email, password, phone } = req.body;
    const normalizedFullname = typeof fullname === "string" ? fullname.trim() : "";
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedPhone = typeof phone === "string" ? phone.trim() : "";

    if (!normalizedFullname || !normalizedEmail || !password || !normalizedPhone) {
      return res.status(400).json({ message: "All Fields Are Required" });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const emailExists = await findUserByEmail(normalizedEmail);
    if (emailExists) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullname: normalizedFullname,
      email: normalizedEmail,
      password: hashedPassword,
      phone: normalizedPhone,
    });

    res.status(201).json({
      message: "User Registered",
      user: {
        id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    console.log("REGISTER ERROR:", error);

    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail || typeof password !== "string" || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
      return res
        .status(401)
        .json({ message: "User Not Found Please Register" });
    }

    const passwordcheck = await bcrypt.compare(password, user.password);
    if (!passwordcheck) {
      return res.status(401).json({ message: "Wrong Password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("token", token, getAuthCookieOptions());

    res.status(200).json({ message: "User Logged IN" });
  } catch (error) {
    console.log("LOGIN ERROR:", error);

    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getUser = async (req, res) => {
  res.status(200).json({ message: "User Authenticated", userData: req.user });
};

export const logoutUser = async (req, res) => {
  const cookieOptions = getAuthCookieOptions();
  res.clearCookie("token", cookieOptions);
  res.clearCookie("token", { ...cookieOptions, path: "/customers" });
  res.status(200).json({ message: "Logged out successfully" });
};
